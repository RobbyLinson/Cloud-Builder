import { CreateSubnetCommand, DescribeSubnetsCommand, DeleteSubnetCommand} from "@aws-sdk/client-ec2"; 

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

// Deletes a subnet
export async function deleteSubnet(ec2Client,subnetId) {      
    
    console.log(subnetId)
    const command = new DeleteSubnetCommand({
        SubnetId: subnetId
    });

    try {
        await ec2Client.send(command);
      console.log(`🧹 Instance with ID ${subnetId} terminated.\n`);
    } catch (err) {
      console.warn(`Failed to terminate instance ${subnetId}.`, err);
    }
};
