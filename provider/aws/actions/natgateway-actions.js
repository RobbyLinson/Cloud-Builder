import { CreateNatGatewayCommand, DescribeNatGatewaysCommand, DeleteNatGatewayCommand} from "@aws-sdk/client-ec2";
import { handleName } from "../validation/validation.js";

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

		//returns list of all natGateways: active and inactive
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
			const response = await ec2Client.send(command);

			let currentState = await describeNatGateways(ec2Client, [natgatewayId])
			.then(currentState => currentState.NatGateways[0].State)
			
			while (currentState !== "deleted") {
				console.log(`Waiting for NatGateway ${natgatewayId} to reach deleted state...`);
				await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay  
				currentState = await describeNatGateways(ec2Client, [natgatewayId])
			.then(currentState => currentState.NatGateways[0].State)
			}

			console.log(`\n🧹 NatGateway with ID ${response.NatGatewayId} terminated.\n`);
    } catch (err) {
      console.warn(`Failed to terminate instance ${natgatewayId}.`, err);
    }
};
