
import { EC2Client } from "@aws-sdk/client-ec2"; //DescribeInstancesCommand
import { createVpc } from './actions/vpc-actions.js';
import { createSubnet } from './actions/subnet-actions.js';
import { createInstance } from './actions/instance-actions.js';

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
	
/*
	async function describeInstances(
		instanceIds
	) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		const command = new DescribeInstancesCommand(instanceIds);
		const response = await ec2Client.send(instanceIds);
		return response;
	}*/

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
		createResource: createResource//, describeInstances: describeInstances
	};
}

export default providerAws;
