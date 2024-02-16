import { CreateSubnetCommand } from "@aws-sdk/client-ec2"; 

export async function createSubnet(ec2Client, {
	name,
	...options
}) {
	// validation of the options object can take place here
	const command = new CreateSubnetCommand(options);
	const response = await ec2Client.send(command);
	return response;
}
