#!/usr/bin/env node

import providerAws from '../provider/aws/providerAws.js';
import { checkAwsFolder } from './awsConfig.js';
import { readMapFromFile, writeMapToFile } from './state.js';
// Import the yargs library
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const stateFile = process.cwd() + '/cli/instances.json';  //it'll make this file for you if it isn't there.
const logFile = process.cwd() + '/cli/logs'; //make log file
import { PDFDocument } from 'pdf-lib';



import { region, accessKeyId, secretAccessKey } from '../credentials.js'; // temporary, replace this asap
//make logo

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));

//Vanshh code
// Prepare an array to hold console output
let consoleOutput = [];

// // Override console.log to capture output
const originalConsoleLog = console.log;
console.log = function (...args) {
  consoleOutput.push(args.join(' '));
  originalConsoleLog.apply(console, args);
};

// Function to save output to PDF
async function saveOutputToPDF(output, filename) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  let text = output.join('\n');
  page.drawText(text, {
    x: 50,
    y: height - 50 - fontSize,
    size: fontSize,
    maxWidth: width - 100,
  });
  const pdfBytes = await pdfDoc.save();
  const loggingFP = path.join(logFile, filename);
  fs.writeFileSync(loggingFP, pdfBytes);
}



console.log("Welcome to Cloud-Builder");

// console.log("\nCommands:\ncloud-builder greet <name>           Gives you a little greeting!")
// console.log("cloud-builder run <file name>        Runs given builder script.");
// console.log("cloud-builder create <type> <name>   Creates aws resource of given type.");
// console.log("cloud-builder delete <name>          Deletes aws resource of given name.\n");

console.log("clb help     for list of commands!");

checkAwsFolder();

// Temporary: load hardcoded provider credentials file
const awsProvider = await providerAws({
	region: region,
	accessKeyId: accessKeyId,
	secretAccessKey: secretAccessKey,
	stateFile: stateFile
});

// Use yargs to define commands and their callbacks
yargs(hideBin(process.argv))
  .command('greet <name>', 'greet a user by name', (yargs) => {
    console.clear();
    return yargs.positional('name', {
      describe: 'name to greet',
      type: 'string',
      default: 'World'
    });
  },  async (argv) => {
    console.log(`Hello, ${argv.name}!`);
     // Save the output to PDF
       await saveOutputToPDF(consoleOutput, 'greetingOutput.pdf' );
  })
  .command('run <file>', 'executes a JavaScript file', (yargs) => {
    return yargs.positional('file', {
      describe: 'executes js file',
      type: 'string'
    });
  }, async (argv) => {
    // Execute the provided JavaScript file
    try {
      execSync(`node ${argv.file}`, { stdio: 'inherit' });
      
    } catch (error) {
      console.error(error.message);
    }
    await  saveOutputToPDF(consoleOutput, 'executionOutput.pdf' );
  })
  .command('create <type> <name> [options..]', 'Create AWS resource', (yargs) => {
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
    console.log(split_options);
	
      const result = await awsProvider.createResource({
        type: argv.type,
        Name: argv.name,
        ...split_options
      });
    } catch (error) {
      console.error('Error creating resource:', error.message);
    }
     await saveOutputToPDF(consoleOutput, 'creationOutput.pdf' );
  })
  .command('delete <name>', 'Deletes AWS resource', (yargs)=> {
    yargs.positional('name', {
      describe: 'Name of resource to delete (e.g., mainVpc, mainSubnet, linuxInstance)',
      type: 'string'
    })
  }, async (argv) => {
    try {
      // Read the map from file to get the instanceId
      readMapFromFile(stateFile, async (err, currentInstances) => {
        if (err) {
          console.error('Error reading map from file:', err);
          return;
        }

        // Check if the provided name exists in the map
        if (!currentInstances.has(argv.name)) {
          console.error(`Resource with name '${argv.name}' not found.`);
          return;
        }

        // Get the instanceId from the map based on the name
        const instanceId = currentInstances.get(argv.name);
		let type = instanceId.split("-")[0];
		if (type === "i") type = "instance";
		
        // Call awsProvider.terminateResource to destroy the AWS resource
        const result = await awsProvider.terminateResource({
          type: type,
		  instanceId: instanceId,
          name: argv.name
        });
      });
      
    } catch (error) {
      console.error('Error deleting resource:', error.message);
    }
    await saveOutputToPDF(consoleOutput, 'deletionOutput.pdf' );
  })
  .parse();


