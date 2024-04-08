import { CreateInternetGatewayCommand, AttachInternetGatewayCommand, DeleteInternetGatewayCommand, DescribeInternetGatewaysCommand, DetachInternetGatewayCommand} from "@aws-sdk/client-ec2"; 

export async function createInternetGateway(ec2Client, {
	name,
	...options
}) {
	const command = new CreateInternetGatewayCommand(options);
	try {
		const response = await ec2Client.send(command);
		if (response) {console.log(`✅ Internet Gateway with ID ${response.InternetGateway.InternetGatewayId} created.\n`);}
		return response.InternetGateway.InternetGatewayId;
	} catch (err) {
		console.warn(`Failed to create Internet Gateway.`, err);
	}
}

export async function attachInternetGatewayToVpc(ec2Client, internetgatewayId, vpcId) {
	const command = new AttachInternetGatewayCommand({
        InternetGatewayId: internetgatewayId,
        VpcId: vpcId});
	try {
		await ec2Client.send(command);
		// the response for this command is {} which doesn't tell us much
		console.log(`🤝 InternetGateway with ID ${internetgatewayId} attached to VPC with ID ${vpcId}.\n`);
	} catch(err) {
		console.warn("Could not attach InternetGateway and VPC", err);
	}
}

export async function detachInternetGatewayFromVpc(ec2Client, internetgatewayId, vpcId) {
	const command = new DetachInternetGatewayCommand({
        InternetGatewayId: internetgatewayId,
        VpcId: vpcId});
	try {
		await ec2Client.send(command);
		// the response for this command is {} which doesn't tell us much
		console.log(`\n🙌 Internet Gateway with ID ${internetgatewayId} has been detached from VPC with ID ${vpcId}.\n`);
	} catch(err) {
		console.warn("Could not detach VPC and InternetGateway", err);
	}
}

export async function describeInternetGateways(ec2Client, internetgatewayIds) {
	const command = new DescribeInternetGatewaysCommand({InternetGatewayIds: internetgatewayIds});
	try {
		const response = await ec2Client.send(command);
		return response;
	} catch (err) {
		console.warn(`Failed to describe InternetGateways.`, err);
	}
}


export async function deleteInternetGateway(ec2Client,internetgatewayId) {      
    
    const command = new DeleteInternetGatewayCommand({
        InternetGatewayId: internetgatewayId
    });

    try {
        await ec2Client.send(command);
      console.log(`\n🧹 InternetGateway with ID ${internetgatewayId} terminated.\n`);
    } catch (err) {
      console.warn(`Failed to terminate instance ${internetgatewayId}.`, err);
    }
};