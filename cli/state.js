import fs from 'fs';
import read from 'readline';
import chalk from 'chalk';
import { EC2Client } from '@aws-sdk/client-ec2';
import { describeAllResources } from '../provider/aws/actions/general-actions.js';

// specify the maximum number of empty lines allowed between code lines
const MAX_NUMBER_OF_EMPTY_LINES = 2;

// Function to read file specified in clb run <filename> and console log it to user
export function previewFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // excluding unnecessary lines
    const cleanContent = processFileContent(content);

    console.log(chalk.yellow('Preview of file content:'));
    console.log(chalk.gray('------------------------------------------------'));
    console.log(cleanContent);
    console.log(chalk.gray('------------------------------------------------'));

    userFileCountNumberOfResourcesByType(filePath);
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

export async function getResourceTypeAndIdByName(resourceName) {
  const filePath = process.cwd() + '/state.json';
  const stateFile = fs.readFileSync(filePath, 'utf8');
  
  try {       
    const state = JSON.parse(stateFile);

    for (const resourceType in state.resources) {
      for (const resource of state.resources[resourceType]) {
        // Check if the resource name matches the provided resourceName
        if (resource.Tags && resource.Tags.some(tag => tag.Key === 'Name' && tag.Value === resourceName)) {
          // If the name matches, return the resource type and id
          return {
            type: resourceType.slice(0,-1),
            id: resource.VpcId || resource.SubnetId || resource.InstanceId || resource.NatGatewayId // Adjust based on actual keys in your state.json
          };
        }
      }
    }
    // If the resource with the given name is not found, return null
    console.log(chalk.red("\nResource with specified name is not found, delete does nothing"))
    return null;
  } catch (err) {
    console.error(err)
    return null;
  }
}

export async function updateStateFile() {
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
          console.log('\nFile state.json was updated');
          StateCountNumberOfResourcesByType().then((counts) => {
            console.log('\tCurrent number of active resources:', counts);
          });
        }
    });
  } catch (err) {
    console.error('Failed to fetch or write resource state:', err);
  }
}

// Function to compare counts from user file and state file
export function compareCounts(userCounts, stateCounts) {
  
  const userKeys = Object.keys(userCounts);
  const stateKeys = Object.keys(stateCounts);
  

  // Check if the keys (resource types) match
  if (userKeys.length !== stateKeys.length || !userKeys.every(key => stateKeys.includes(key))) {
    return false;
  }
  
  // Check if the counts match for each resource type
  for (const key of userKeys) {
    if (userCounts[key] !== stateCounts[key]) {
      return false;
    }
  }
  
  return true;
}

// counts the number of running resources written in a state file
export async function StateCountNumberOfResourcesByType(){
  try {

    // Read the contents of the state.json file
    const jsonData = fs.readFileSync('state.json', 'utf-8', (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return {}
        } else {
          console.error('Error reading state file:', err);
          return {}
        };
      }
    });

    // Parse the JSON content to extract resource information
    const resources = JSON.parse(jsonData).resources;

    // Initialize an object to store resource counts
    const resourceCounts = {};

    // Iterate over the resources and count occurrences of each type
    for (const resourceType in resources) {
      const count = resources[resourceType].length;
      resourceCounts[resourceType] = count;
    }

    // Return the resource counts object
    return resourceCounts;
  } catch (err) {
    // console.error('Failed to count number of resources by type:', err);
    return {};
  }
}

// counts the number of resources, which should be created after running clb run <filename> 
export async function userFileCountNumberOfResourcesByType(filePath){
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // excluding unnecessary lines
    const cleanContent = processFileContent(content);
    const lines = cleanContent.split('\n');
    
    // counts init
    let vpcCount = 0;
    let subnetCount = 0;
    let instanceCount = 0;
    let natGatewayCount = 0;

    // loops handling
    let insideLoop = false;
    let loopIterations = 0;

    // should be decoupled later
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if the line starts a loop
      if (trimmedLine.startsWith('for')) {
        insideLoop = true; // Set insideLoop to true when entering a loop
        
        // Regular expression to match the for loop initialization and condition
        const regex = /for\s*\(([^;]*);([^;]*);[^)]*\)/;
        const match = trimmedLine.match(regex);

        if (match && match[1] && match[2]) {
          // Extract loop initialization 
          const loopInitValue = match[1].trim().split('=')[1].trim();
          
          // Extract number from condition 
          const loopCondition = match[2].trim().split(/<|<=|>|>=/);
          const loopLimit = loopCondition[1].trim();
            
          // Calculate iterations
          loopIterations = eval(loopLimit) - eval(loopInitValue);
        }
      }

      // Check if the line contains a resource creation
      if (trimmedLine.includes('awsProvider.createResource')) {
        // Keep parsing the line until we find the "type" parameter
        let currentLine = trimmedLine;
        let currentIndex = lines.indexOf(currentLine); // Get the initial index
        while (currentIndex < lines.length) {
          // Check if the line contains the "type" parameter
          if (currentLine.includes('type')) {
            // Extract the resource type
            const resourceType = currentLine.split('type:')[1].trim().split(',')[0];

            // Increment counts based on the resource type
            if (resourceType === "'vpc'" || resourceType === '"vpc"') {
              vpcCount += (insideLoop ? loopIterations : 1);
            } else if (resourceType === "'subnet'" || resourceType === '"subnet"') {
              subnetCount += (insideLoop ? loopIterations : 1);
            } else if (resourceType === "'instance'" || resourceType === '"instance"') {
              instanceCount += (insideLoop ? loopIterations : 1);
            } else if (resourceType === "'natGateway'" || resourceType === '"natGateway"') {
              natGatewayCount += (insideLoop ? loopIterations : 1);
            }
            break; // Exit the loop once the "type" parameter is found
          }
          currentIndex++; // Move to the next line
          currentLine = lines[currentIndex];
        }
      }

      // Check if the line contains a resource termination
      if (trimmedLine.includes('awsProvider.terminateResource')) {
        // Keep parsing the line until we find the "type" parameter
        let currentLine = trimmedLine;
        let currentIndex = lines.indexOf(currentLine); // Get the initial index
        while (currentIndex < lines.length) {
          // Check if the line contains the "type" parameter
          if (currentLine.includes('type')) {
            // Extract the resource type
            const resourceType = currentLine.split('type:')[1].trim().split(',')[0];

            // Decrement counts based on the resource type
            if (resourceType === "'vpc'" || resourceType === '"vpc"') {
              vpcCount += (insideLoop ? -loopIterations : -1);
            } else if (resourceType === "'subnet'" || resourceType === '"subnet"') {
              subnetCount += (insideLoop ? -loopIterations : -1);
            } else if (resourceType === "'instance'" || resourceType === '"instance"') {
              instanceCount += (insideLoop ? -loopIterations : -1);
            } else if (resourceType === "'natGateway'" || resourceType === '"natGateway"') {
              natGatewayCount += (insideLoop ? -loopIterations : -1);
            }
            break; // Exit the loop once the "type" parameter is found
          }
          currentIndex++; // Move to the next line
          currentLine = lines[currentIndex];
        }
      }

      // Check if the line ends a loop
      if (trimmedLine.endsWith('}')) {
        insideLoop = false; // Set insideLoop to false when exiting a loop
        loopIterations = 0; 
      }
    }

    // Construct the resource counts object
    const resourceCounts = {
      vpcs: vpcCount,
      subnets: subnetCount,
      instances: instanceCount,
      natGateways: natGatewayCount
    };

    // console.log(chalk.yellow('Resource Changes Summary:'));
    // console.log(chalk.gray('------------------------------------------------'));
    // console.log(resourceCounts)
    // console.log(chalk.gray('------------------------------------------------'));
    
    return resourceCounts // return resource counts object
  } catch (error) {
    console.error(chalk.red(`Error reading file '${filePath}':`), error.message);
  }
}

// Function excludes unnecessary lines like comments or empty lines 
function processFileContent(fileContent){
  const lines = fileContent.split('\n');
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

    if (line.trim().startsWith('//') || line.trim().startsWith('import')) {
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

  return nonCommentedContent;
}