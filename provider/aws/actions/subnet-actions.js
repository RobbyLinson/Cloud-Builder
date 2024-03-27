import { CreateSubnetCommand, DescribeSubnetsCommand, DeleteSubnetCommand} from "@aws-sdk/client-ec2"; 
import { handleName } from "../validation/validation.js";

// Creates a new subnet
export async function createSubnet(ec2Client, {
	...options
}) {

	const validatedOpt = handleName({type: 'subnet', input: options})
	const command = new CreateSubnetCommand(validatedOpt);
	try {
		const response = await ec2Client.send(command);
		
		if (response) {console.log(`✅ Subnet with ID ${response.Subnet.SubnetId} created.\n`);}
		return response.Subnet.SubnetId;
	} catch (err) {
		console.warn(`Failed to create subnet.`, err);
	}
}

// Returns information on subnet based on SubnetId
export async function describeSubnets(ec2Client, subnetIds) {
	const command = new DescribeSubnetsCommand({SubnetIds: subnetIds});
	try {
		const response = await ec2Client.send(command);
		return response;
	} catch (err) {
		console.warn(`Failed to describe subnets.`, err);
	}
}

// Deletes a subnet by ID
export async function deleteSubnet(ec2Client,subnetId) {      
    
    const command = new DeleteSubnetCommand({
        SubnetId: subnetId
    });

    try {
        await ec2Client.send(command);
      console.log(`\n🧹 Instance with ID ${subnetId} terminated.\n`);
    } catch (err) {
      console.warn(`Failed to terminate instance ${subnetId}.`, err);
    }
};
