
import { EC2Client } from "@aws-sdk/client-ec2";
import { createVpc, describeVpcs, deleteVPC } from './actions/vpc-actions.js';
import { createSubnet, describeSubnets, deleteSubnet } from './actions/subnet-actions.js';
import { createInstance, describeInstances, deleteInstance } from './actions/instance-actions.js';

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

	async function terminateResource({type, instanceId}){
		switch (type) {
			case 'vpc':
				return deleteVPC(ec2Client, instanceId);
			case 'subnet':
				return deleteSubnet(ec2Client, instanceId);
			case 'instance':
                return deleteInstance(ec2Client, instanceId);
			default:
				return {
					error: `Unknown resource type: ${type}`
				};
		}
		
	}

	async function createResource({
		type,
		...options
	}) {
		switch (type) {
		case 'vpc':
			return createVpc(ec2Client, {
				...options
			});
		case 'subnet':
			return createSubnet(ec2Client, {
				...options
			});
		case 'instance':
			return createInstance(ec2Client, {
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
		terminateResource: terminateResource
	};
}

export default providerAws;
