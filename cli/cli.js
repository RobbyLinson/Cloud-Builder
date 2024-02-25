#!/usr/bin/env node

// Import the yargs library

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import fs from 'fs';
//const boxen = require('boxen');
//const yargs = require('yargs/yargs');
//const { hideBin } = require('yargs/helpers');
//const { exec } = require('child_process');

//make logo

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("Welcome to cloud builder");

console.log("\n commands:\n greet-Cli  greet yourNameHere       Gives you a little greeting!")
console.log("greet-Cli run testFileNameHere                  Runs given file.")

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

    // NEEDS CONNECTION TO TERRAFORM TO WORK !!!
  yargs(hideBin(process.argv))
    .command('create', 'Provision infrastructure using Terraform', () => {
      console.log("Starting 'terraform apply' to provision infrastructure...");
      // Replace '/path' with the actual path to terraform config files
      execSync('terraform apply', { cwd: '/path' }, (err, stdout, stderr) => {
        if (err) {
          console.error('Error running terraform apply:', err);
          return;
        }
        // Success
        console.log(stdout);
        console.error(stderr);
      });
    })
    .parse();
  
    


