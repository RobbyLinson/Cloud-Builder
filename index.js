#!/usr/bin/env node

// Import the yargs library

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const fs = require("fs");
//const boxen = require('boxen');


//make logo

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("Welcome to cloud builder");

console.log("\n commands:\n greet-Cli  greet yourNameHere       Gives you a little greeting!")

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




