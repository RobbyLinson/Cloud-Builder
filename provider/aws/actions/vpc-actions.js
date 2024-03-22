import { CreateVpcCommand, DescribeVpcsCommand, DeleteVpcCommand, CreateTagsCommand } from "@aws-sdk/client-ec2"; 
import { validateVPCOptions } from "../validation/validation.js"

// Creates a new VPC
export async function createVpc(ec2Client, {
	...options
}) {
	const validatedOptions = await validateVPCOptions(options);
	const command = new CreateVpcCommand(validatedOptions);
	try {
		const response = await ec2Client.send(command)

		if (response) {console.log(`✅ VPC with ID ${response.Vpc.VpcId} created.\n`);}
		return response.Vpc.VpcId;
	} catch (err) {
		console.warn(`Failed to create VPC.`, err);
	}
}

export async function updateVpcName(ec2Client, {id, name}){
	
	const input = {
        Resources: [id],
        Tags: [{ Key: "Name", Value: name }]
    };

	// const validatedInput = await validateVPCOptions(input);
	const command = new CreateTagsCommand(input)
	try {
		const response = await ec2Client.send(command);
		return response

	} catch (err) {
		console.warn(`Failed to update VPC.`, err);
	}
}

// Returns information on VPC based on VpcId
export async function describeVpcs(ec2Client, vpcIds) {
	const command = new DescribeVpcsCommand({VpcIds: vpcIds});
	try {
		const response = await ec2Client.send(command);
		return response;
	} catch (err) {
		console.warn(`Failed to describe VPCs.`, err);
	}
}

// Deletes a VPC by ID
export async function deleteVPC(ec2Client,vpcId) {	  
	
	const command = new DeleteVpcCommand({
		VpcId: vpcId
	});

	try {
	  	await ec2Client.send(command);
	//   	await waitUntilVpc??ConnectionDeleted( doesn't work for vpc, find an alternative, please
	// 		{ client: ec2Client },
	// 		{ InstanceIds: [instanceI] },
	//   );
	  console.log(`\n🧹 VPC with ID ${vpcId} terminated.\n`);
	} catch (err) {
	  console.warn(`Failed to terminate VPC ${vpcId}.`, err);
	}
};