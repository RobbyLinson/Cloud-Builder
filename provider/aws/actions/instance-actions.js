import { RunInstancesCommand, DescribeInstancesCommand, TerminateInstancesCommand} from "@aws-sdk/client-ec2"; 
import { handleName } from "../validation/validation.js";

// Creates a new instance or runs existing instance depending on options
export async function createInstance(ec2Client, {
	...options
}) {
	// validation of the options object can take place here
	const handledOpt = handleName({type: 'instance', input: options});
	const command = new RunInstancesCommand(handledOpt);
	try {
		const response = await ec2Client.send(command);
		if (response) {console.log(`✅ EC2 Instance with ID ${response.Instances[0].InstanceId} created.\n`);}
		return response.Instances[0].InstanceId;
	} catch (err) {
		console.warn(`Failed to run instance.`, err);
	}
}

// Returns information on instance based on InstanceId 
export async function describeInstances(ec2Client, instanceIds) {
	const command = new DescribeInstancesCommand({InstanceIds: instanceIds});
	try {
		const response = await ec2Client.send(command);
		return response;
	} catch (err) {
		console.warn(`Failed to describe instances.`, err);
	}
}

// Returns only active instances
export async function describeInstancesWithState(ec2Client, states) {
    try {
        const command = new DescribeInstancesCommand({
            Filters: [
                { Name: 'instance-state-name', Values: states }
            ]
        });
        const response = await ec2Client.send(command);
        return response.Reservations.flatMap(reservation => reservation.Instances);
    } catch (err) {
        console.error('Failed to describe instances:', err);
        return [];
    }
}

async function getInstanceState(ec2Client, instanceId) {
	const command = new DescribeInstancesCommand({
	  InstanceIds: [instanceId],
	});
  
	try {
	  const response = await ec2Client.send(command);
  
	  if (response.Reservations && response.Reservations.length > 0) {
		for (const reservation of response.Reservations) {
		  for (const instance of reservation.Instances) {
			
			const currentInstanceId = instance.InstanceId;
			const state = instance.State.Name;
  
			if (currentInstanceId === instanceId) {
			  return state;
			}
		  }
		}
	  }
  
	  // If instance not found or no instances in the response, return null
	  return null;
	} catch (err) {
	  console.error(`Failed to describe instances.`, err);
	  throw err;
	}
  }

// Deletes an instance, there must be a delay between deleting instance and subnet or you will
// get a dependency error
export async function deleteInstance(ec2Client,instanceId) {      
    
  const command = new TerminateInstancesCommand({
      InstanceIds: [ instanceId ]
  });

  try {
    await ec2Client.send(command);
	
	let currentState = await getInstanceState(ec2Client, instanceId);
	while (currentState !== "terminated") {
		console.log(`Waiting for instance ${instanceId} to reach terminated state...`);
		await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay  
		currentState = await getInstanceState(ec2Client, instanceId);
	}
    
	console.log(`\n🧹 Instance with ID ${instanceId} terminated.\n`);
  } catch (err) {
    console.warn(`Failed to terminate instance ${instanceId}.`, err);
  }
};
