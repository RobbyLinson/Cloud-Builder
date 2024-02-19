
import { EC2Client } from "@aws-sdk/client-ec2";
import { createVpc, describeVpcs, deleteVPC } from './actions/vpc-actions.js';
import { createSubnet, describeSubnets } from './actions/subnet-actions.js';
import { createInstance, describeInstances  } from './actions/instance-actions.js';

async function providerAws({
	region,
	accessKeyId,
	secretAccessKey
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
		default:
			return {
				error: `Unknown resource type: ${type}`
			};
		}
	}

	async function deleteInstance({type, instanceId}){
		switch (type) {
			case 'vpc':
				return deleteVPC(ec2Client, instanceId);
			default:
				return {
					error: `Unknown resource type: ${type}`
				};
		}
		
	}

	async function createResource({
		type,
		name,
		...options
	}) {
		switch (type) {
		case 'vpc':
			return createVpc(ec2Client, {
				name,
				...options
			});
		case 'subnet':
			return createSubnet(ec2Client, {
				name,
				...options
			});
		case 'instance':
			return createInstance(ec2Client, {
				name,
				...options
			});
		default:
			return {
				error: `Unknown resource type: ${type}`
			};
		}
	}



	return {
		createResource: createResource, 
		describeResources: describeResources,
		terminateInstance: deleteInstance
	};
}

export default providerAws;
