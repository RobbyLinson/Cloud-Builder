import { CreateRouteTableCommand, DescribeRouteTablesCommand, DeleteRouteTableCommand, AssociateRouteTableCommand} from "@aws-sdk/client-ec2";

export async function createRouteTable(ec2Client, {
    name,
	...options
}) {
	// validation of the options object can take place here
	const command = new CreateRouteTableCommand(options);
	try {
		const response = await ec2Client.send(command);
		
		if (response) {console.log(`✅ RouteTable with ID ${response.RouteTable.RouteTableId} created.\n`);}
		return response.RouteTable.RouteTableId;
	} catch (err) {
		console.warn(`Failed to create RouteTable.`, err);
	}
}

export async function describeRouteTables(ec2Client, routetableIds) {
	const command = new DescribeRouteTablesCommand({RouteTableIds: routetableIds});
	try {
		const response = await ec2Client.send(command);
		return response;
	} catch (err) {
		console.warn(`Failed to describe RouteTables.`, err);
	}
}

export async function deleteRouteTable(ec2Client,routetableId) {      
    
    const command = new DeleteRouteTableCommand({
        RouteTableId: routetableId
    });

    try {
        await ec2Client.send(command);
      console.log(`\n🧹 RouteTable with ID ${routetableId} terminated.\n`);
    } catch (err) {
      console.warn(`Failed to terminate instance ${routetableId}.`, err);
    }
};

export async function attachRouteTable(ec2Client, routetableId, subnetId ) {
	const command = new AssociateRouteTableCommand({RouteTableId: routetableId,
	SubnetId: subnetId
	});
	try {
		const response = await ec2Client.send(command);
		console.log(`Attached routetable ${routetableId} to subnet ${subnetId}\n`);
	} catch (err) {
		console.warn(`Failed to attach subnet to routetable.`, err);
	}
}
