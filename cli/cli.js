#!/usr/bin/env node

// Import the Provider Manager
import { ProviderManager } from '../provider/providerManager.js';

// Import the yargs library
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { execSync } from 'child_process';

// State related imports
import { updateStateFile, compareCounts  } from '../provider/aws/state/state.js';
import { previewFileContent, userFileCountNumberOfResourcesByType } from '../provider/aws/state/userFileParsers.js';
import { stateCountNumberOfResourcesByType, getResourceTypeAndIdByName } from '../provider/aws/state/stateFileParsers.js';

// Create new Provider Manager to handle importing available providers.
const providers = await new ProviderManager();

// Create Provider object based on current active provider.
const activeProvider = await providers.returnActiveProvider();

// Make logo
console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));

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
  }, (argv) => {
    console.log(`Hello, ${argv.name}!`);
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
