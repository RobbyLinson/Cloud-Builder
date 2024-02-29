#!/usr/bin/env node

// Import the yargs library
import providerAws from '../provider/aws/providerAws.js';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import fs from 'fs';
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
  
//Updated 'create' command to use providerAws.createResource
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
.parse();



//destroy method
//takes user inputted name, searches instances.json's map for the key then returns the value(the id)


//to test i reccomend using create to create a resource, see instances.json to see the the mapped values and then call delete on the name
//of the value you made

//currently just manually plugged in vpc for the type , as that was the last state destroy was working for me( i was trying to implement a switch case
//for the other types)



const filename = 'cli\\instances.json';  //it'll make this file for you if it isnt there.

yargs(hideBin(process.argv))
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

        console.log('Resource deletion result:', result);

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
    console.log('Map data has been written to', filename);
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











