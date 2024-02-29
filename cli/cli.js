#!/usr/bin/env node

// Import the yargs library

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import read from 'readline';

//const boxen = require('boxen');


//make logo

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("Welcome to cloud builder");

console.log("\n commands:\n greet-Cli  greet yourNameHere       Gives you a little greeting!")
console.log("greet-Cli run testFileNameHere                  Runs given file.")
const filePath = os.homedir();
console.log(filePath + " and the opereating system is "+ os.type());
checkAndPopulate();

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
  
function readDir(filePath,callback){
    fs.readdir(filePath,(err,file) =>{
        if(err)
        {
            console.error("error occured",err)
            callback([]);
        }
        callback(file);
    });
}

async function createObjectForIni (){
    const readLine = read.Interface({
        input:process.stdin,
        output:process.stdout
    });
    let questionArr = [];

    function askQuestion(query)
    {
        return new Promise(resolve =>{
            readLine.question(query,response=>{
                questionArr.push(response);
                resolve();
            });
        });
    }
    await askQuestion('What is your AWS key? ');
    await askQuestion('What is your AWS secret key? ');
    readLine.close();
    return questionArr;
}


async function wrtieFileAsync(path,data){
    return new Promise((resolve,reject)=>{
        fs.writeFile(path,data,(err)=>{
            if(err){
                reject(err);
            } else{
                resolve();
            }
        });
    });
}

async function main(){
    try{
        const arr= await createObjectForIni();
        const awsFilePath =filePath+(os.type()==='Windows_NT' ? "\\.aws\\" : "/.aws/"); //what os type
        let duplicateArr = ["[default]","aws_access_key_id=","aws_secret_access_key="];
        for(let i =0; i<arr.length; i++)
        {
            duplicateArr[i+1]=duplicateArr[i+1] + arr[i];
        }
        const outputString = duplicateArr.join("\n");
        await wrtieFileAsync(awsFilePath+"credentials",outputString);
        const stringToConfig="[default]\nregion=eu-west-1";
        await wrtieFileAsync(awsFilePath+"config",stringToConfig);
    } catch {
        console.error("problem");
    }
}

function createAwsFoulder(){
    const creationOfFoldier = filePath+(os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
    fs.mkdir(creationOfFoldier,(err)=>{
        if(err)
        {
            return console.error(err);
        }
    });
}

async function checkAndPopulate()
{ 
    readDir(filePath,function(files){
        let exists = false;
        for(const val of files)
        {
            if(val == '.aws')
            {
                exists = true;
            }
        }
        if(!exists)
        {
            createAwsFoulder();
            main();
        }
        else
        {
            const awsFouilderPath = filePath+(os.type()==='Windows_NT' ? "\\.aws" : "/.aws");
            readDir(awsFouilderPath,function(filesInAWS){
                let config = false;
                let cred = false;
                for(const val of filesInAWS)
                {
                    if(val == 'credentials')
                    {
                        cred = true;
                    }
                    else if (val == 'config')
                    {
                        config=true;
                    }
                }
                if(!cred && !config)
                {
                    main();
                }
            });
        }
    });
}


