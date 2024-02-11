
import { EC2Client, CreateVpcCommand, CreateSubnetCommand, RunInstancesCommand } from "@aws-sdk/client-ec2"; 


async function providerAws({
	region,
	accessKeyId,
	secretAccessKey
}) {

	async function createResource({
		type,
		...options
	}) {
		const ec2Client = new EC2Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
		
		var command;
		switch (type) {
		case 'vpc':
			// validate options here once this is merged with Options branch
			command = new CreateVpcCommand(options);
			break;
		case 'subnet':
			// validate options here once this is merged with Options branch
			command = new CreateSubnetCommand(options);
			break;
		case 'instance':
			// validate options here once this is merged with Options branch
			command = new RunInstancesCommand(options);
			break;
		default:
			return {
				error: `Unknown resource type: ${type}`
			};
		}
		
		const response = await ec2Client.send(command);
		return response;
	}

	return {
		createResource: createResource
	};
}

export default providerAws;