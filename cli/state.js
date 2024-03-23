import fs from 'fs';
import read from 'readline';
import chalk from 'chalk';
import { EC2Client } from '@aws-sdk/client-ec2';
import { describeAllResources } from '../provider/aws/actions/general-actions.js';

// Function to read map data from file
export function readMapFromFile(filename, callback) {
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
export function writeMapToFile(map, filename) {
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

// specify the maximum number of empty lines allowed between code lines
const MAX_NUMBER_OF_EMPTY_LINES = 2;

// Function to read file specified in clb run <filename> and console log it to user
export function previewFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // this block excludes unnecessary lines like comments or empty lines 
    const lines = content.split('\n');
    let nonCommentedContent = '';
    let consecutiveEmptyLines = 0;
    let insideMultilineComment = false;

    for (let line of lines) {
      if (insideMultilineComment) {
        if (line.includes('*/')) {
          insideMultilineComment = false;
        }
        continue;
      }

      if (line.trim().startsWith('//')) {
        continue; // Ignore single line comments
      } else if (line.trim().startsWith('/*')) {
        insideMultilineComment = true;
        continue; // Ignore multiline comments
      } else if (line === '') {
        consecutiveEmptyLines++;
        if (consecutiveEmptyLines > MAX_NUMBER_OF_EMPTY_LINES) {
          continue; // Ignore if more than MAX_NUMBER_OF_EMPTY_LINES consecutive empty lines
        }
      } else {
        consecutiveEmptyLines = 0; // Reset consecutive empty lines counter
      }

      nonCommentedContent += line + '\n';
    }


    console.log(chalk.yellow('Preview of file content:'));
    console.log(chalk.gray('------------------------------------------------'));
    console.log(nonCommentedContent);
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

export async function writeResourceStateToFile() {
  try {
    const ec2Client = new EC2Client();
    const allResources = await describeAllResources(ec2Client);

    const jsonData = {
      metadata: {
        created_at: new Date().toISOString(), // Add a timestamp for creation
      },
      resources: allResources
    };

    const jsonString = JSON.stringify(jsonData, null, 2); // Convert object to JSON string

    fs.writeFile('state.json', jsonString, (err) => {
        if (err) {
          console.error('Error writing resource state JSON file:', err);
        } else {
          console.log('state.json was updated');
        }
    });
  } catch (err) {
    console.error('Failed to fetch or write resource state:', err);
  }
}