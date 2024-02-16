import { CreateSubnetCommand, DescribeSubnetsCommand } from "@aws-sdk/client-ec2"; 

// Creates a new subnet
export async function createSubnet(ec2Client, {
	name,
	...options
}) {
	// validation of the options object can take place here
	const command = new CreateSubnetCommand(options);
	const response = await ec2Client.send(command);
	return response;
}

// Returns information on subnet based on SubnetId
export async function describeSubnets(ec2Client, subnetIds) {
	const command = new DescribeSubnetsCommand({SubnetIds: subnetIds});
    const response = await ec2Client.send(command);
    return response;
}