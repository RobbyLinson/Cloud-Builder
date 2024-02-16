
import { EC2Client, CreateVpcCommand, CreateSubnetCommand, RunInstancesCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2"; 
import { validateVPCOptions } from './validationVPC.js';


async function providerAws({
	region,
	accessKeyId,
	secretAccessKey
}) {

	async function createVpc({
		name,
		...options
	}) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		const validatedOptions = await validateVPCOptions(options);
		const command = new CreateVpcCommand(validatedOptions);
		const response = await ec2Client.send(command);
		return response;
	}

	async function createSubnet({
		name,
		...options
	}) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		// validation of the options object can take place here
		const command = new CreateSubnetCommand(options);
		const response = await ec2Client.send(command);
		return response;
	}
	
	async function createInstance({
		name,
		...options
	}) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		// validation of the options object can take place here
		const command = new RunInstancesCommand(options);
		const response = await ec2Client.send(command);
		return response;
	}

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
	}

	async function createResource({
		type,
		name,
		...options
	}) {
		switch (type) {
		case 'vpc':
			return createVpc({
				name,
				...options
			});
		case 'subnet':
			return createSubnet({
				name,
				...options
			});
		case 'instance':
			return createInstance({
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
		createResource: createResource, describeInstances: describeInstances
	};
}

export default providerAws;
