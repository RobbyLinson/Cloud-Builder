import { CreateNatGatewayCommand, DescribeNatGatewaysCommand, DeleteNatGatewayCommand} from "@aws-sdk/client-ec2";

export async function createNatGateway(ec2Client, {
	...options
}) {
	
	const validatedOpt = handleName({type: 'natgateway', input: options})
	const command = new CreateNatGatewayCommand(validatedOpt);
	try {
		const response = await ec2Client.send(command);
		
		if (response) {console.log(`✅ NatGateway with ID ${response.NatGateway.NatGatewayId} created.\n`);}
		return response.NatGateway.NatGatewayId;
	} catch (err) {
		console.warn(`Failed to create NatGateway.`, err);
	}
}

export async function describeNatGateways(ec2Client, nategatewayIds) {
	const command = new DescribeNatGatewaysCommand({NatGatewayIds: nategatewayIds});
	try {
		const response = await ec2Client.send(command);
		return response;
	} catch (err) {
		console.warn(`Failed to describe NatGateways.`, err);
	}
}

export async function deleteNatGateway(ec2Client,natgatewayId) {      
    
    const command = new DeleteNatGatewayCommand({
        NatGatewayId: natgatewayId
    });

    try {
        await ec2Client.send(command);
      console.log(`\n🧹 NatGateway with ID ${natgatewayId} terminated.\n`);
    } catch (err) {
      console.warn(`Failed to terminate instance ${natgatewayId}.`, err);
    }
};
