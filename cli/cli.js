#!/usr/bin/env node

// Import the yargs library
import providerAws from '../provider/aws/providerAws.js';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import read from 'readline';
import { execSync } from 'child_process';
const filename = 'cli\\instances.json';  //it'll make this file for you if it isnt there.

import { region, accessKeyId, secretAccessKey } from '../credentials.js'; // temporary, replace this asap
//make logo

console.log(chalk.blueBright("  ____ _                 _   _           _ _     _           "));
console.log(chalk.blueBright(" / ___| | ___  _   _  __| | | |__  _   _(_) | __| | ___ _ __ "));
console.log(chalk.blueBright("| |   | |/ _ \\| | | |/ _` | | '_ \\| | | | | |/ _` |/ _ \\ '__|"));
console.log(chalk.blueBright("| |___| | (_) | |_| | (_| | | |_) | |_| | | | (_| |  __/ |   "));
console.log(chalk.blueBright(" \\____|_|\\___/ \\__,_|\\__,_| |_.__/ \\__,_|_|_|\\__,_|\\___|_|   "));





console.log("Welcome to Cloud-Builder");

console.log("\nCommands:\ncloud-builder greet <name>           Gives you a little greeting!")
console.log("cloud-builder run <file name>        Runs given builder script.");
console.log("cloud-builder create <type> <name>   Creates aws resource of given type.");
console.log("cloud-builder delete <name>          Deletes aws resource of given name.\n");

const filePath = os.homedir();
// console.log(filePath + " and the opereating system is "+ os.type());
checkAndPopulate();

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
  
      console.log('Resource creation result:', result);
      
        // Read the map from file or create a new one if file doesn't exist
        readMapFromFile(filename, (err, currentInstances) => {
          if (err) {
            console.error('Error reading map from file:', err);
            return;
          }
  
          // Add/update data in the map based on user input
          currentInstances.set(argv.name, result);
  
          // Write the updated map back to the file
          writeMapToFile(currentInstances, filename);
        });
      
    } catch (error) {
      console.error('Error creating resource:', error.message);
    }
  })
  .command('delete <name>', 'Delete AWS resource', (yargs)=> {
    yargs.positional('name', {
      describe: 'Name of resource to delete (e.g., vpc, subnet, instance)',
      type: 'string'
    })
  }, async (argv) => {
    try {
      // Read the map from file to get the instanceId
      readMapFromFile(filename, async (err, currentInstances) => {
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
          instanceId: instanceId
        });

        //console.log('Resource deletion result:', result);

        // Remove the entry from the map after destroying the resource
        currentInstances.delete(argv.name);

        // Write the updated map back to the file
        writeMapToFile(currentInstances, filename);
      });
      
    } catch (error) {
      console.error('Error deleting resource:', error.message);
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







// Function to read map data from file
function readMapFromFile(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('Instances file not found. Creating new file.');
        return callback(null, new Map()); // Return a new Map if file doesn't exist
      } else {
        console.error('Error reading instances file:', err);
        return callback(err, null);
      }
    }
    try {
      // If file exists but is empty, return an empty Map
      if (!data) {
        return callback(null, new Map());
      }

      const parsedData = JSON.parse(data);
      // Convert object to a Map
      const objectToMap = new Map();
      for (let key in parsedData) {
        objectToMap.set(key, parsedData[key]);
      }
      callback(null, objectToMap);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      callback(error, null);
    }
  });
}

// Function to write map data to file
function writeMapToFile(map, filename) {
  // Convert map to a regular object (key-value pairs)
  const mapToObject = {};
  for (let [key, value] of map) {
    mapToObject[key] = value;
  }

  // Convert object to JSON
  const jsonData = JSON.stringify(mapToObject, null, 2);

  // Write data to a file
  fs.writeFile(filename, jsonData, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    // console.log('Map data has been written to', filename);
  });
}



// Read the map from file or create a new one if file doesn't exist
readMapFromFile(filename, (err, currentInstances) => {
  if (err) {
    console.error('Error reading map from file:', err);
    return;
  }

  // Add/update data in the map based on user input

  // Write the updated map back to the file
  writeMapToFile(currentInstances, filename);
});


 //run test file command 
  // Define the yargs command
  // yargs(hideBin(process.argv))
  //   .command('run <file>', 'execute a JavaScript file', (yargs) => {
  //     return yargs.positional('file', {
  //       describe: 'executes js file',
  //       type: 'string'
  //     });
  //   }, (argv) => {
  //     // Execute the provided JavaScript file
  //     try {
  //       execSync(`node ${argv.file}`, { stdio: 'inherit' });
  //     } catch (error) {
  //       console.error(error.message);
  //     }
  //   })
  //   .parse();

  //Updated 'create' command to use providerAws.createResource
// yargs(hideBin(process.argv))
// .command('create <type> <name> [options..]', 'Create AWS resource', (yargs) => {
//   yargs.positional('type', {
//     describe: 'Type of resource to create (e.g., vpc, subnet, instance)',
//     type: 'string'
//   }).positional('name', {
//     describe: 'Name for the resource',
//     type: 'string'
//   }).options('options', {
//     describe: 'Additional options in key=value format',
//     type: 'array'
//   });
// }, async (argv) => {
//   try {
// 	var split_options = {};
//     argv.options.forEach((opt) => {
//       const [key, value] = opt.split('=');
//       split_options[key] = value;
//     });
// 	console.log(split_options);
//     const result = await awsProvider.createResource({
//       type: argv.type,
//       Tags: [{Name: argv.name}],
//       ...split_options
//     });

//     console.log('Resource creation result:', result);
    
//       // Read the map from file or create a new one if file doesn't exist
//       readMapFromFile(filename, (err, currentInstances) => {
//         if (err) {
//           console.error('Error reading map from file:', err);
//           return;
//         }

//         // Add/update data in the map based on user input
//         currentInstances.set(argv.name, result);

//         // Write the updated map back to the file
//         writeMapToFile(currentInstances, filename);
//       });
    
//   } catch (error) {
//     console.error('Error creating resource:', error.message);
//   }
// })
// .parse();



//destroy method
//takes user inputted name, searches instances.json's map for the key then returns the value(the id)


//to test i reccomend using create to create a resource, see instances.json to see the the mapped values and then call delete on the name
//of the value you made

//currently just manually plugged in vpc for the type , as that was the last state destroy was working for me( i was trying to implement a switch case
//for the other types)





// yargs(hideBin(process.argv))
//   .command('delete <name>', 'Delete AWS resource', (yargs)=> {
//     yargs.positional('name', {
//       describe: 'Name of resource to delete (e.g., vpc, subnet, instance)',
//       type: 'string'
//     })
//   }, async (argv) => {
//     try {
//       // Read the map from file to get the instanceId
//       readMapFromFile(filename, async (err, currentInstances) => {
//         if (err) {
//           console.error('Error reading map from file:', err);
//           return;
//         }

//         // Check if the provided name exists in the map
//         if (!currentInstances.has(argv.name)) {
//           console.error(`Resource with name '${argv.name}' not found.`);
//           return;
//         }

//         // Get the instanceId from the map based on the name
//         const instanceId = currentInstances.get(argv.name);
// 		let type = instanceId.split("-")[0];
// 		if (type === "i") type = "instance";
		
//         // Call awsProvider.terminateResource to destroy the AWS resource
//         const result = await awsProvider.terminateResource({
//           type: type,
//           instanceId: instanceId
//         });

//         //console.log('Resource deletion result:', result);

//         // Remove the entry from the map after destroying the resource
//         currentInstances.delete(argv.name);

//         // Write the updated map back to the file
//         writeMapToFile(currentInstances, filename);
//       });
      
//     } catch (error) {
//       console.error('Error deleting resource:', error.message);
//     }
//   })
//   .parse();
