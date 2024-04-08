import fs from 'fs';
import { EC2Client } from '@aws-sdk/client-ec2';
import { describeAllResources, terminateAllResources } from '../actions/general-actions.js';
import { stateCountNumberOfResourcesByType } from './stateFileParsers.js';

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
        console.log('File state.json was updated');
        stateCountNumberOfResourcesByType().then((counts) => {
          console.log(`\tCurrent number of active resources:${formatCounts(counts)}`);
        });
      }
    });
  } catch (err) {
    console.error('Failed to fetch or write resource state:', err);
  }
}

function formatCounts(counts) {
  return `
    \t\t- vpcs: ${counts.vpcs},
    \t\t- subnets: ${counts.subnets},
    \t\t- instances: ${counts.instances},
    \t\t- natGateways: ${counts.natGateways},
    \t\t- internetGateways: ${counts.internetGateways},
    \t\t- routeTables: ${counts.routeTables}
  `;
}

export async function reinitializeInfrastructure(){
  const ec2Client = new EC2Client();
  await terminateAllResources(ec2Client);
}


// Function to compare objects with number of resources from user file and state file
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



