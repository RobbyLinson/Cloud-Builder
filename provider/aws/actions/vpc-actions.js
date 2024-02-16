import { CreateVpcCommand } from "@aws-sdk/client-ec2"; 
import { validateVPCOptions } from '../validation/validationVPC.js';

export async function createVpc(ec2Client, {
	name,
	...options
}) {
	const validatedOptions = await validateVPCOptions(options);
	const command = new CreateVpcCommand(validatedOptions);
	const response = await ec2Client.send(command);
	return response;
}
