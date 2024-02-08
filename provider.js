
import aws from 'aws-sdk';
import { EC2Client, CreateVpcCommand, CreateSubnetCommand, RunInstancesCommand } from "@aws-sdk/client-ec2"; 


async function providerAws({
	region,
	accessKeyId,
	secretAccessKey
}) {

	async function() createVpc({
		name,
		cidrBlock,
		...options
	}) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		const command = new CreateVpcCommand({
			CidrBlock: cidrBlock
			// this needs to be able to handle all of the optional parameters in "options"
			// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/CreateVpcCommand/
		});
		const response = await ec2Client.send(command);
		return {
			metadata: response.$metadata, // return metadata for debugging
			vpc: response.Vpc
		};
	}

	async function createSubnet({
		name,
		mainVpc,
		cidrBlock,
		...options
	}) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		const command = new CreateSubnetCommand({
			VpcId: mainVpc.id,
			CidrBlock: cidrBlock
			// this needs to be able to handle all of the optional parameters in "options"
			// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/CreateSubnetCommand/
		});
		const response = await ec2Client.send(command);
		return {
			metadata: response.$metadata, // return metadata for debugging
			subnet: response.Subnet
		};
	}
	
	// CreateInstanceCommand was here first but it doesn't actually seem to exist
	async function createInstance({
		name,
		subnet,
		imageId,
		...options
	}) {
		const ec2Client = new EC2Client({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey
		}
		});
		const command = new RunInstancesCommand({
			// some required parameters are missing here + the optional parameters
			// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/RunInstancesCommand/
			SubnetId: subnet.id,
			ImageId: imageId
		});
		const response = await ec2Client.send(command);
		return {
			metadata: response.$metadata,
			groups: response.Groups, // has the description "Not supported." in the documentation, unsure if needed
			instances: response.Instances,
			ownerId: response.OwnerId,
			requesterId: response.RequesterId,
			reservationId: response.reservationId
		};
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
		createResource,    
	};
}

export default providerAws;