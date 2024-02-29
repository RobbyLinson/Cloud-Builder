#!/usr/bin/env node

// Import the yargs library
import providerAws from '../provider/aws/providerAws.js';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import fs from 'fs';
//const boxen = require('boxen');
//const yargs = require('yargs/yargs');
//const { hideBin } = require('yargs/helpers');
//const { exec } = require('child_process');
import { region, accessKeyId, secretAccessKey } from '../credentials.js'; // temporary

//make logo

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("Welcome to cloud builder");

console.log("\n commands:\n greet-Cli  greet yourNameHere       Gives you a little greeting!")
console.log("greet-Cli run testFileNameHere                  Runs given file.")

// Temporary: load hardcoded provider credentials file
const awsProvider = await providerAws({
	region: region,
	accessKeyId: accessKeyId,
	secretAccessKey: secretAccessKey
});

// Use yargs to define commands and their callbacks
yargs(hideBin(process.argv))
  .command('greet [name]', 'greet a user by name', (yargs) => {
    console.clear();
    return yargs.positional('name', {
      describe: 'name to greet',
      type: 'string',
      default: 'World'
    });
  }, (argv) => {
    console.log(`Hello, ${argv.name}!`);
  })
  .parse();

  import { execSync } from 'child_process';
  
  

  //run test file command 
  // Define the yargs command
  yargs(hideBin(process.argv))
    .command('run <file>', 'execute a JavaScript file', (yargs) => {
      return yargs.positional('file', {
        describe: 'executes js file',
        type: 'string'
      });
    }, (argv) => {
      // Execute the provided JavaScript file
      try {
        execSync(`node ${argv.file}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(error.message);
      }
    })
    .parse();
  
// Updated 'create' command to use providerAws.createResource
yargs(hideBin(process.argv))
.command('create <type> <name> [options]', 'Create AWS resource', (yargs) => {
  yargs.positional('type', {
    describe: 'Type of resource to create (e.g., vpc, subnet, instance)',
    type: 'string'
  }).positional('name', {
    describe: 'Name for the resource',
    type: 'string'
  }).option('options', {
    describe: 'Additional options in key=value format',
    type: 'array'
  });
}, async (argv) => {
  try {
    const options = argv.options.reduce((acc, option) => {
      const [key, value] = option.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const result = await awsProvider.createResource({
      type: argv.type,
      name: argv.name,
      ...options
    });

    console.log('Resource creation result:', result);
  } catch (error) {
    console.error('Error creating resource:', error.message);
  }
})
.parse();



