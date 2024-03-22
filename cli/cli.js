#!/usr/bin/env node

//import providerAws from '../provider/aws/providerAws.js';
import { ProviderManager } from '../provider/providerManager.js';
import { checkAwsFolder } from './awsConfig.js';
import { readMapFromFile, writeMapToFile } from './state.js';
// Import the yargs library
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { execSync } from 'child_process';
const stateFile = process.cwd() + '/cli/instances.json';  //it'll make this file for you if it isn't there.

import { region, accessKeyId, secretAccessKey } from '../credentials.js'; // temporary, replace this asap
//make logo

const providers = await new ProviderManager();
await providers.loadProviderConfig();

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("Welcome to Cloud-Builder");

// console.log("\nCommands:\ncloud-builder greet <name>           Gives you a little greeting!")
// console.log("cloud-builder run <file name>        Runs given builder script.");
// console.log("cloud-builder create <type> <name>   Creates aws resource of given type.");
// console.log("cloud-builder delete <name>          Deletes aws resource of given name.\n");

console.log("clb help     for list of commands!");

checkAwsFolder();

// Temporary: load hardcoded provider credentials file
const awsProvider = await providers.aws({
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
  }, (argv) => {
    console.log(`Hello, ${argv.name}!`);
  })
  .command('run <file>', 'executes a JavaScript file', (yargs) => {
    return yargs.positional('file', {
      describe: 'executes js file',
      type: 'string'
    });
  }, async (argv) => {
    if (await previewFileContent(argv.file)) {
      try {
        execSync(`node ${argv.file}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(error.message);
      }
    } else {
      console.log('Action cancelled by user.');
    }
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
  
      
	  	// These things are now handled in provider code for consistency
		// with actions that are run through "builder scripts".
		/*
		//console.log('Resource creation result:', result);
        // Read the map from file or create a new one if file doesn't exist
        readMapFromFile(stateFile, (err, currentInstances) => {
          if (err) {
            console.error('Error reading map from file:', err);
            return;
          }
  
		  //
          // Add/update data in the map based on user input
          //currentInstances.set(argv.name, result);
  
          // Write the updated map back to the file
          // writeMapToFile(currentInstances, stateFile);
        });
      */
    } catch (error) {
      console.error('Error creating resource:', error.message);
    }
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

		// These things are now handled in provider code for consistency
		// with actions that are run through "builder scripts".
		// 
        // console.log('Resource deletion result:', result);
        // Remove the entry from the map after destroying the resource
        // currentInstances.delete(argv.name);
		//
        // Write the updated map back to the file
        // writeMapToFile(currentInstances, stateFile);
      });
      
    } catch (error) {
      console.error('Error deleting resource:', error.message);
    }
  })
  .parse();



  function previewFileContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(chalk.yellow('Preview of file content:'));
      console.log(chalk.gray('------------------------------------------------'));
      console.log(content);
      console.log(chalk.gray('------------------------------------------------'));
      // Confirm with the user to proceed
      const readlineInterface = read.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      return new Promise((resolve) => {
        readlineInterface.question(chalk.green('Do you want to proceed with this action? (y/n) '), (answer) => {
          readlineInterface.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });
    } catch (error) {
      console.error(chalk.red(`Error reading file '${filePath}':`), error.message);
      return Promise.resolve(false);
    }
  }