#!/usr/bin/env node

// Import the Provider Loader
import { ProviderLoader } from './providerLoader.js';

// Import the yargs library
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { execSync } from 'child_process';

// State related imports
import { updateStateFile, compareCounts, reinitializeInfrastructure } from '../provider/aws/state/state.js';
import { askUserToProceed, previewFileContent, userFileCountNumberOfResourcesByType } from '../provider/aws/state/userFileParsers.js';
import { getResourceTypeAndIdByName, stateCountNumberOfResourcesByType } from '../provider/aws/state/stateFileParsers.js';

// drawings
import { drawActionCancelledByUser, drawResourcesDoesNotMatch, drawResourcesMatch, drawLogo } from './chalk-messages.js';

// Import filesystem library
import fs from 'fs';

// Gets current time for logging.
const sessionTime = new Date();
const sessionTimeString = sessionTime.getDate() + "_" + (sessionTime.getMonth() + 1) + "_" + sessionTime.getFullYear();

import readline from 'readline';

import util from 'util';

const folderPath = './cli/logs';
// Check if the folder exists
if (!fs.existsSync(folderPath)) {
  // If it doesn't exist, create it
  fs.mkdirSync(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating folder:', err);
    } else {
      console.log('Folder created successfully!');
    }
  });
}

// Create log file
var logPath = process.cwd() + '/cli/logs/' + sessionTimeString + '.txt'; 
var logFile = fs.createWriteStream(logPath, { flags: 'a' });
var logStdout = process.stdout;

// Override console.log to write to logs
console.log = function () {
   logFile.write(util.format.apply(null, arguments) + '\n');
   logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

const credentialsFilePath = process.cwd() + '/user_profile.json';

function loadCredentials() {
  if (!fs.existsSync(credentialsFilePath)) return {};
  return JSON.parse(fs.readFileSync(credentialsFilePath, 'utf8'));
}

function saveCredentials(credentials) {
  fs.writeFileSync(credentialsFilePath, JSON.stringify(credentials, null, 2));
}

async function changeUser() {
  const rl = await readline.createInterface({
	input: process.stdin,
	output: process.stdout
  });

  const userId = await new Promise(resolve => {
		rl.question("Enter username: ", resolve);
	});
  const credentials = await loadCredentials();
  if (credentials.current === userId) {
    console.log(chalk.red('This is the current user already.'));
    return userId;
  }
  credentials.current = userId;
  await saveCredentials(credentials);
  console.log(chalk.green('User successfully changed.'));
  return userId;
}

// Add a check for the 'user' command before proceeding with other commands
if (process.argv.includes('user')) {
  await changeUser();
  process.exit(0);
}

var userId = loadCredentials().current;
if (userId == null) {
	userId = await changeUser();
}

// Create new Provider Loader to handle importing available providers.
const providers = await new ProviderLoader();

// Create Provider object based on current active provider.
const activeProvider = await providers.returnActiveProvider(userId);

// Draws Cloud-Builder Logo
drawLogo();

console.log("\nWelcome to Cloud-Builder\n");

// Use yargs to define commands and their callbacks
yargs(hideBin(process.argv))
  .scriptName("clb")
  .command('greet <name>', 'Greets a user by name', (yargs) => {
    console.clear();
    return yargs.positional('name', {
      describe: 'name to greet',
      type: 'string',
      default: 'World'
    });
  },  async (argv) => {
    console.log(`\nHello, ${argv.name}!`);
  })
  .command('run [-u] [-p] <file>', 'Executes a JavaScript file', (yargs) => {
    return yargs
    .positional('file', {
      describe: 'executes js file',
      type: 'string'
    })
    .option('u', {
      describe: 'Use compare and update state feature',
      type: 'boolean',
      default: false
    })
    .option('p',{
      describe: 'Enables file preview',
      type: 'boolean',
      default: false
    });
  }, async (argv) => {
    try {
      if(argv.u){  // if flag -u (update) is set, we compare present and future infrastructure 
        // get objects with number of resources on ec2 client and in user defined file
        const userFileCounts = await userFileCountNumberOfResourcesByType(argv.file);
        const stateFileCounts = await stateCountNumberOfResourcesByType();

        // Compare counts from user file and state file
        const matchCounts = compareCounts(userFileCounts, stateFileCounts);
        
        if(matchCounts){ 
          // if the infrastructure is the same
          
          // we notify user about that
          drawResourcesMatch();

          // we ask whether user wants to reinitialize it 
          if(!await askUserToProceed()){
            // if user doesn't want to, we finish the execution
            drawActionCancelledByUser();
            return;
          }
          // otherwise we leave this if else part
        } else{ 
          // if the infrastructure differs, we check if user used other flags
          if (argv.p){ 
            // if flag -p (preview) is set
            await previewFileContent(argv.file); 
          }
          // we notify user about that
          drawResourcesDoesNotMatch();
          // and we leave this if else part (related to counts)
        }

        // basically deletes everything from the current state
        reinitializeInfrastructure();
        // then we proceed to the last part running the user file and updating the state
        // so we leave this if else part (related to -u)
      
      } else { // if flag -u (update) is not set, we create just the infrastructure
        if (argv.p) {
          // if flag -p (preview) is set we show file preview
          await previewFileContent(argv.file);
          // fix the cli ui
          console.log(chalk.gray('------------------------------------------------')); // bad decision, but this fixes cli ui

          // after looking at the preview we ask if user wants to proceed
          if(!await askUserToProceed()){
            // if user doesn't want to, we finish the execution
            drawActionCancelledByUser();
            return;
          }
          // if user wants to proceed, we leave this if else part (related to -p flag)
        } 
      }

      // run the user file
      execSync(`node ${argv.file}`, { stdio: 'inherit' });
      // update the stateFile
      updateStateFile();


    } catch (error) {
      console.error(error.message);
    }
  })
  .command('create <type> <name> [options..]', 'Creates a new resource', (yargs) => {
    yargs.positional('type', {
      describe: 'Type of resource to create (e.g., vpc, subnet, instance)',
      type: 'string'
    }).positional('name', {
      describe: 'Name for the resource',
      type: 'string'
    }).options('options', {
      describe: 'Additional options in key=value format',
      type: 'array'
    });
  }, async (argv) => {
    try {
    var split_options = {};
      argv.options.forEach((opt) => {
        const [key, value] = opt.split('=');
        split_options[key] = value;
      });
	
      const result = await activeProvider.createResource({
        type: argv.type,
        Name: argv.name,
        ...split_options
      });

      // updates state file
      updateStateFile();
  
    } catch (error) {
      console.error('Error creating resource:', error.message);
    }
     

     
  })
  .command('delete <name>', 'Deletes a resource by name', (yargs)=> {
    yargs.positional('name', {
      describe: 'Name of resource to delete (e.g., mainVpc, mainSubnet, linuxInstance)',
      type: 'string'
    })
  }, async (argv) => {
    try {

      const data = await getResourceTypeAndIdByName(argv.name);
      
      // Call activeProvider.terminateResource to destroy the resource
      if (data){
        const result = await activeProvider.terminateResource({
          type: data.type,
		      instanceId: data.id
        });
        // update state file
        updateStateFile();
      }
    } catch (error) {
      console.error('Error deleting resource:', error.message);
    }
   

  })
  .command('update', 'Updates state file', async => { updateStateFile()})
  .demandCommand(1, "").recommendCommands().strict()
  .parse();



//   //WIP PDF LOGGING CODE
//   import { PDFDocument } from 'pdf-lib';
// import { execSync } from 'childprocess';

// // Prepare an array to hold console output
// let consoleOutput = [];

// // Override console.log to capture output
// const originalConsoleLog = console.log;
// console.log = function (...args) {
//   consoleOutput.push(args.join(' '));
//   originalConsoleLog.apply(console, args);
// };

// // Function to save output to PDF
// async function saveOutputToPDF(output, filename) {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage();
//   const { width, height } = page.getSize();
//   const fontSize = 12;
//   let text = output.join('\n');
//   page.drawText(text, {
//     x: 50,
//     y: height - 50 - fontSize,
//     size: fontSize,
//     maxWidth: width - 100,
//   });
//   const pdfBytes = await pdfDoc.save();
//   fs.writeFileSync(filename, pdfBytes);
// }

// // Display CLI banner and welcome message
// console.log("  __                                                 ");
// console.log(" / | |        | | | |     () | | | __    ");
// console.log("| |   | |/  \| | | |/  | | ' \\| | | | | |/  |/  \ '|");
// console.log("| || | () |  | (| | | |) |  | | | (| |  / |    ");
// console.log(" \||_/ \,|\,| |./ \,|||\,|\||    ");
// console.log("Welcome to cloud builder");
// console.log("\nCommands:");
// console.log(" greet-Cli greet yourNameHere       Gives you a little greeting!");
// console.log("greet-Cli run testFileNameHere                  Runs given file.");
// // Configure yargs
// yargs(hideBin(process.argv))
//   .command('greet [name]', 'greet a user by name', (yargs) => {
//     return yargs.positional('name', {
//       describe: 'name to greet',
//       type: 'string',
//       default: 'World',
//     });
//   }, async (argv) => {
//     console.log(Hello, ${argv.name}!);
//     // Save the output to PDF
//     await saveOutputToPDF(consoleOutput, 'greetingOutput.pdf');
//   })
//   .command('run <file>', 'execute a JavaScript file', (yargs) => {
//     return yargs.positional('file', {
//       describe: 'executes js file',
//       type: 'string',
//     });
//   }, async (argv) => {
//     // Execute the provided JavaScript file
//     try {
//       execSync(node ${argv.file}, { stdio: 'inherit' });
//     } catch (error) {
//       console.error(error.message);
//     }
//     // Save the output to PDF
//     await saveOutputToPDF(consoleOutput, 'executionOutput.pdf');
//   })
//   .parse();



