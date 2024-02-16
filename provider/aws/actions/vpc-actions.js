import { CreateVpcCommand, DescribeVpcsCommand } from "@aws-sdk/client-ec2"; 
import { validateVPCOptions } from '../validation/validationVPC.js';

// Creates a new VPC
export async function createVpc(ec2Client, {
	name,
	...options
}) {
	const validatedOptions = await validateVPCOptions(options);
	const command = new CreateVpcCommand(validatedOptions);
	const response = await ec2Client.send(command);
	return response;
}

// Returns information on VPC based on VpcId
export async function describeVpcs(ec2Client, vpcIds) {
	const command = new DescribeVpcsCommand({VpcIds: vpcIds});
    const response = await ec2Client.send(command);
    return response;
}