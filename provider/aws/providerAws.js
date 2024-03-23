import { EC2Client } from "@aws-sdk/client-ec2";
import { createVpc, describeVpcs, deleteVPC, updateVpcName } from './actions/vpc-actions.js';
import { createSubnet, describeSubnets, deleteSubnet } from './actions/subnet-actions.js';
import { createInstance, describeInstances, deleteInstance } from './actions/instance-actions.js';
import { createNatGateway, describeNatGateways, deleteNatGateway } from "./actions/natgateway-actions.js";
import { readMapFromFile, writeMapToFile } from '../../cli/state.js';
import { describeAllResources } from "./actions/general-actions.js";


async function providerAws({
	region,
	accessKeyId,
	secretAccessKey,
	stateFile
}) {
	
	const ec2Client = new EC2Client({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey
		}
	});
	

	async function describeResources({
		type, resourceIds
	}) {
		switch (type) {
		case 'vpc':
			return describeVpcs(ec2Client, resourceIds);
		case 'subnet':
			return describeSubnets(ec2Client, resourceIds);
		case 'instance':
			return describeInstances(ec2Client, resourceIds);
		case 'natgateway':
			return describeNatGateways(ec2Client, resourceIds);
		case 'all': // describe all resources on ec2 client
			return describeAllResources(ec2Client);
		default:
			return {
				error: `Unknown resource type: ${type}`
			};
		}
	}

	async function terminateResource({type, instanceId, name=""}){
		switch (type) {
			case 'vpc':
				await deleteVPC(ec2Client, instanceId);
				break;
			case 'subnet':
				await deleteSubnet(ec2Client, instanceId);
				break;
			case 'instance':
                await deleteInstance(ec2Client, instanceId);
				break;
			case 'natgateway':
				await deleteNatGateway(ec2Client, instanceId);
				break;
			default:
				return {
					error: `Unknown resource type: ${type}`
				};
		}
		
		if (name !== "") {
			readMapFromFile(stateFile, (err, currentInstances) => {
				if (err) {
					console.error('Error reading map from file:', err);
					return;
				}
			  
				// Add/update data in the map based on new resources
				currentInstances.delete(name);
			  
				// Write the updated map back to the file
				writeMapToFile(currentInstances, stateFile);
			});
		}
	}

	async function createResource({
		type,
		Name,
		...options
	}) {
		var newId;
		
		switch (type) {
		case 'vpc':
			newId = await createVpc(ec2Client, {
				Name, ...options
			});
			break;
		case 'subnet':
			newId = await createSubnet(ec2Client, {
				Name, ...options
			});
			break;
		case 'instance':
			newId = await createInstance(ec2Client, {
				Name, ...options
			});
			break;
		case 'natgateway':
			newId = await createNatGateway(ec2Client, {
				Name, ...options
			});
			break;
		default:
			return {
				error: `Unknown resource type: ${type}`
			};
		}
		
		readMapFromFile(stateFile, (err, currentInstances) => {
			if (err) {
				console.error('Error reading map from file:', err);
				return;
			}

			// Add/update data in the map based on new resources
			currentInstances.set(Name, newId);
	  
			// Write the updated map back to the file
			writeMapToFile(currentInstances, stateFile);
        });
		return newId;
	}

	async function updateResource({
		type,
		id,
		name
	}){
		switch (type){
			case 'vpc':
				return updateVpcName(ec2Client, {id, name})
		}
	}


	return {
		createResource: createResource, 
		describeResources: describeResources,
		terminateResource: terminateResource,
		updateResource: updateResource
	};
}

export default providerAws;
