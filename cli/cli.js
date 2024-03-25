#!/usr/bin/env node

//import providerAws from '../provider/aws/providerAws.js';
import { ProviderManager } from '../provider/providerManager.js';
import { checkAwsFolder, getCredentials } from './awsConfig.js';
import { readMapFromFile, writeMapToFile } from './state.js';
// Import the yargs library
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { execSync } from 'child_process';

//state related imports
import { previewFileContent, updateStateFile, userFileCountNumberOfResourcesByType, StateCountNumberOfResourcesByType, compareCounts, getResourceTypeAndIdByName } from './state.js';


import { region, accessKeyId, secretAccessKey } from '../credentials.js'; // temporary, replace this asap
//make logo

const providers = await new ProviderManager();
await providers.loadProviderConfig();

//make logo
console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("\nWelcome to Cloud-Builder\n");

// console.log("\nCommands:\ncloud-builder greet <name>           Gives you a little greeting!")
// console.log("cloud-builder run <file name>        Runs given builder script.");
// console.log("cloud-builder create <type> <name>   Creates aws resource of given type.");
// console.log("cloud-builder delete <name>          Deletes aws resource of given name.\n");

console.log("clb help     for list of commands!");

await checkAwsFolder();
const awsCredentials = await getCredentials();

// Temporary: load hardcoded provider credentials file
const awsProvider = await providers.aws({
	region: awsCredentials.region,
	accessKeyId: awsCredentials.accessKeyId,
	secretAccessKey: awsCredentials.secretAccessKey
});

// Use yargs to define commands and their callbacks
yargs(hideBin(process.argv))
  .scriptName("clb")
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

    // get objects with number of resources on ec2 client and in user defined file
    const userFileCounts = await userFileCountNumberOfResourcesByType(argv.file);
    const stateFileCounts = await StateCountNumberOfResourcesByType();
  
    // Compare counts from user file and state file
    const matchCounts = compareCounts(userFileCounts, stateFileCounts);
    
    // for now we don't care if state differs from filename from clb run <filename>
    if (matchCounts) {
      console.log(chalk.gray('------------------------------------------------'));
      console.log(chalk.green('The number of resources match, which means we do some action later'));
      console.log(chalk.gray('------------------------------------------------'));
      try {
        if (await previewFileContent(argv.file)) {
          execSync(`node ${argv.file}`, { stdio: 'inherit' });
          // creates a state.json, which should represent list of all resources in a ec2 client in a current working directory
          writeResourceStateToFile();
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
	
      const result = await awsProvider.createResource({
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
  .command('delete <name>', 'Deletes AWS resource', (yargs)=> {
    yargs.positional('name', {
      describe: 'Name of resource to delete (e.g., mainVpc, mainSubnet, linuxInstance)',
      type: 'string'
    })
  }, async (argv) => {
    try {

      const data = await getResourceTypeAndIdByName(argv.name);
      
      // Call awsProvider.terminateResource to destroy the AWS resource
      if (data){
        const result = await awsProvider.terminateResource({
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
  .parse();
