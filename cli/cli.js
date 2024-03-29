#!/usr/bin/env node

// Import the Provider Loader
import { ProviderLoader } from './providerLoader.js';

// Import the yargs library
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { execSync } from 'child_process';

// State related imports
import { updateStateFile, compareCounts  } from '../provider/aws/state/state.js';
import { previewFileContent, userFileCountNumberOfResourcesByType } from '../provider/aws/state/userFileParsers.js';
import { stateCountNumberOfResourcesByType, getResourceTypeAndIdByName } from '../provider/aws/state/stateFileParsers.js';

// Import filesystem library
import fs from 'fs';
import path from 'path';
import prompt from 'syncprompt';

// CLI user credentials path.
const credentialsFilePath = './user_credentials.json';

// Gets current time for logging.
const sessionTime = new Date();
const sessionTimeString = sessionTime.getDate() + "_" + (sessionTime.getMonth()+1) + "_" + sessionTime.getFullYear();

//Make logo
console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));

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

function loadCredentials() {
  if (!fs.existsSync(credentialsFilePath)) return {};
  return JSON.parse(fs.readFileSync(credentialsFilePath, 'utf8'));
}

function saveCredentials(credentials) {
  fs.writeFileSync(credentialsFilePath, JSON.stringify(credentials, null, 2));
}

function register() {
  const userId = prompt('Enter user ID (1, 2, or 3): ').trim();
  const password = prompt('Enter password: ').trim();
  const credentials = loadCredentials();
  if (credentials[userId]) {
    console.log(chalk.red('User ID already exists.'));
    return;
  }
  credentials[userId] = password;
  saveCredentials(credentials);
  console.log(chalk.green('Registration successful.'));
}

function login() {
  const userId = prompt('Enter user ID (1, 2, or 3): ').trim();
  const password = prompt('Enter password: ').trim();
  const credentials = loadCredentials();
  if (credentials[userId] === password) {
    console.log(chalk.green('Login successful.'));
    return userId;
  } else {
	console.log(credentials);
    console.log(chalk.red('Invalid user ID or password.'));
    process.exit(1);
  }
}

// Add a check for the 'register' or 'login' command before proceeding with other commands
if (process.argv.includes('register')) {
  register();
  process.exit(0);
}

const userId = login(); // Ensure user is logged in before continuing

// Create new Provider Loader to handle importing available providers.
const providers = await new ProviderLoader();

// Create Provider object based on current active provider.
const activeProvider = await providers.returnActiveProvider(userId);

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
  .command('run <file>', 'Executes a JavaScript file', (yargs) => {
    return yargs.positional('file', {
      describe: 'executes js file',
      type: 'string'
    });
  }, async (argv) => {

    // get objects with number of resources on ec2 client and in user defined file
    const userFileCounts = await userFileCountNumberOfResourcesByType(argv.file);
    const stateFileCounts = await stateCountNumberOfResourcesByType();
    
    // Compare counts from user file and state file
    const matchCounts = compareCounts(userFileCounts, stateFileCounts);
    
    // for now we don't care if state differs from filename from clb run <filename>
    if (matchCounts) {
      console.log(chalk.gray('------------------------------------------------'));
      console.log(chalk.green('The number of resources match.\n\tDo you want to initialize same resources again?'));
      console.log(chalk.gray('------------------------------------------------'));
      try {
        if (await previewFileContent(argv.file)) {
          execSync(`node ${argv.file}`, { stdio: 'inherit' });
          // creates a state.json, which should represent list of all resources in a ec2 client in a current working directory
          updateStateFile();
        } else {
          console.log(chalk.gray('------------------------------------------------'));
          console.log(chalk.red('Action cancelled by user.'));
          console.log(chalk.gray('------------------------------------------------'));
        }
      } catch (error) {
        console.error(error.message);
      }
    } else {
      console.log(chalk.gray('------------------------------------------------'));
      console.log(chalk.yellow('The number of resources DOES NOT match, which means we do some action'));
      console.log(chalk.gray('------------------------------------------------'));
      try {
        if (await previewFileContent(argv.file)) {
          execSync(`node ${argv.file}`, { stdio: 'inherit' });
          // creates a state.json, which should represent list of all resources in a ec2 client in a current working directory
          updateStateFile();
        } else {
          console.log(chalk.gray('------------------------------------------------'));
          console.log(chalk.red('Action cancelled by user.'));
          console.log(chalk.gray('------------------------------------------------'));
        }
      } catch (error) {
        console.error(error.message);
      }
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
      }
      
      // update state file
      updateStateFile();

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



