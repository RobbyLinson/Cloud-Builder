import { RunInstancesCommand } from "@aws-sdk/client-ec2"; 

export async function createInstance(ec2Client, {
	name,
	...options
}) {
	// validation of the options object can take place here
	const command = new RunInstancesCommand(options);
	const response = await ec2Client.send(command);
	return response;
}
