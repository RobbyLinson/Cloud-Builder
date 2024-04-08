import chalk from "chalk";
import fs from "fs";


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

// counts the number of running resources written in a state file
export async function stateCountNumberOfResourcesByType(){
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