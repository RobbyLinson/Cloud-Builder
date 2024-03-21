import { CreateNatGatewayCommand, DeleteNatGatewayCommand } from "@aws-sdk/client-ec2";

export async function createNatGateway(ec2Client, {
    name,
	...options
}) {
	// validation of the options object can take place here
	const command = new CreateNatGatewayCommand(options);
	try {
		const response = await ec2Client.send(command);
		
		if (response) {console.log(`✅ NatGateway with ID ${response.NatGateway.NatGatewayId} created.\n`);}
		return response.NatGateway.NatGatewayId;
	} catch (err) {
		console.warn(`Failed to create NatGateway.`, err);
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
