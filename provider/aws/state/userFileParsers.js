import chalk from "chalk";
import fs from "fs";
import read from 'readline';

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

// counts the number of resources, which should be created after running clb run <filename> 
export async function userFileCountNumberOfResourcesByType(filePath){
  try {
    const content = fs.readFileSync(filePath, 'utf8');
      
    // excluding unnecessary lines
    const cleanContent = processFileContent(content);
    const lines = cleanContent.split('\n');
      
    // Construct the resource counts object
    const resourceCounts = {
      vpcs: 0,
      subnets: 0,
      instances: 0,
      natGateways: 0
    };
  
    // loops handling
    let insideLoop = false;
    let loopIterations = 0;
  
    // should be decoupled later
    for (const line of lines) {
      const trimmedLine = line.trim();
  
      // Check if the line starts a loop
      if (trimmedLine.startsWith('for')) {
        insideLoop = true; // Set insideLoop to true when entering a loop
        // get number of iterations is expected from for loop
        loopIterations = getNumberOfIterations(trimmedLine);
      }
  
      // Check if the line contains a resource creation
      if (trimmedLine.includes('awsProvider.createResource')) {
        // modify counts in a resource count object passed
        handleCountIncrease(trimmedLine, lines, insideLoop, resourceCounts, loopIterations)
      }
  
      // Check if the line contains a resource termination
      if (trimmedLine.includes('awsProvider.terminateResource')) {
        // modify counts in a resource count object passed
        handleCountDecrease(trimmedLine, lines, insideLoop, resourceCounts, loopIterations);
      }
  
      // Check if the line ends a loop
      if (trimmedLine.endsWith('}')) {
        insideLoop = false; // Set insideLoop to false when exiting a loop
        loopIterations = 0; 
      }
    }
  
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

// currLine must be a for loop init, evaluates the number of iterations
function getNumberOfIterations(currLine){
  // Regular expression to match the for loop initialization and condition
  const regex = /for\s*\(([^;]*);([^;]*);[^)]*\)/;
  const match = currLine.match(regex);
    
  if (match && match[1] && match[2]) {
    // Extract loop initialization 
    const loopInitValue = match[1].trim().split('=')[1].trim();
    
    // Extract number from condition 
    const loopCondition = match[2].trim().split(/<|<=|>|>=/);
    const loopLimit = loopCondition[1].trim();
        
    // Calculate iterations
    return eval(loopLimit) - eval(loopInitValue);
  }
}

// function that modifies counts in a resource count object passed ↓
function handleCountIncrease(currLine, allLines, insideLoop, resourceCounts, loopIterations){
  // Keep parsing the line until we find the "type" parameter
  let currentLine = currLine;
  let currentIndex = allLines.indexOf(currentLine); // Get the initial index
  while (currentIndex < allLines.length) {
    // Check if the line contains the "type" parameter
    if (currentLine.includes('type')) {
      // Extract the resource type
      const resourceType = currentLine.split('type:')[1].trim().split(',')[0];

      // Increment counts based on the resource type
      if (resourceType === "'vpc'" || resourceType === '"vpc"') {
        resourceCounts.vpcs += (insideLoop ? loopIterations : 1);
      } else if (resourceType === "'subnet'" || resourceType === '"subnet"') {
        resourceCounts.subnets += (insideLoop ? loopIterations : 1);
      } else if (resourceType === "'instance'" || resourceType === '"instance"') {
        resourceCounts.instances += (insideLoop ? loopIterations : 1);
      } else if (resourceType === "'natGateway'" || resourceType === '"natGateway"') {
        resourceCounts.natGateways += (insideLoop ? loopIterations : 1);
      } else if (resourceType === "'internetGateways'" || resourceType === '"internetGateways"') {
        resourceCounts.internetGateways += (insideLoop ? loopIterations : 1);
      } else if (resourceType === "'routeTables'" || resourceType === '"routeTables"') {
        resourceCounts.routeTables += (insideLoop ? loopIterations : 1);
      }
      break; // Exit the loop once the "type" parameter is found
    }
    currentIndex++; // Move to the next line
    currentLine = allLines[currentIndex];
  }
}

// function that modifies counts in a resource count object passed ↓
function handleCountDecrease(currLine, allLines, insideLoop, resourceCounts, loopIterations){
  // Keep parsing the line until we find the "type" parameter
  let currentLine = currLine;
  let currentIndex = allLines.indexOf(currentLine); // Get the initial index
  while (currentIndex < allLines.length) {
    // Check if the line contains the "type" parameter
    if (currentLine.includes('type')) {
      // Extract the resource type
      const resourceType = currentLine.split('type:')[1].trim().split(',')[0];

      // Decrement counts based on the resource type
      if (resourceType === "'vpc'" || resourceType === '"vpc"') {
        resourceCounts.vpcs += (insideLoop ? -loopIterations : -1);
      } else if (resourceType === "'subnet'" || resourceType === '"subnet"') {
        resourceCounts.subnets += (insideLoop ? -loopIterations : -1);
      } else if (resourceType === "'instance'" || resourceType === '"instance"') {
        resourceCounts.instances += (insideLoop ? -loopIterations : -1);
      } else if (resourceType === "'natGateway'" || resourceType === '"natGateway"') {
        resourceCounts.natGateways += (insideLoop ? -loopIterations : -1);
      } else if (resourceType === "'internetGateways'" || resourceType === '"internetGateways"') {
        resourceCounts.internetGateways += (insideLoop ? loopIterations : -1);
      } else if (resourceType === "'routeTables'" || resourceType === '"routeTables"') {
        resourceCounts.routeTables += (insideLoop ? loopIterations : -1);
      }
      break; // Exit the loop once the "type" parameter is found
    }
    currentIndex++; // Move to the next line
    currentLine = allLines[currentIndex];
  }
}