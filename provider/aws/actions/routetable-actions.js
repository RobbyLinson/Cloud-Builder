import { CreateRouteTableCommand, DescribeRouteTablesCommand, DeleteRouteTableCommand, AssociateRouteTableCommand, CreateRouteCommand, DeleteRouteCommand, DisassociateRouteTableCommand} from "@aws-sdk/client-ec2";

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
}

export async function attachRouteTableToSubnet(ec2Client, routetableId, subnetId ) {
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

export async function detachRouteTableFromSubnet(ec2Client, routetableId, subnetId ) {

	const assocId = await getAssociationId(ec2Client, routetableId, subnetId);
	const command = new DisassociateRouteTableCommand({
		AssociationId: assocId
	});
	try {
		await ec2Client.send(command);
		console.log(`✂️ Detached routetable ${routetableId} from subnet ${subnetId}\n`);
	} catch (err) {
		console.warn(`Failed to detach subnet from routetable.`, err);
	}
}

export async function attachRouteTableToGateway(ec2Client, destinationcidrblock, gatewayId, routetableId ) {
	const command = new CreateRouteCommand({DestinationCidrBlock: destinationcidrblock,
	GatewayId: gatewayId,
	RouteTableId: routetableId
	});
	try{
		const response = await ec2Client.send(command);
		console.log(`🤝 Attached gateway ${gatewayId} to routetable ${routetableId}\n`);
	} catch (err) {
		console.warn(`Failed to attach gateway to routetable.`, err);
	}
}

export async function detachRouteTableFromGateway(ec2Client, destinationcidrblock, routetableId ) {
	const command = new DeleteRouteCommand({DestinationCidrBlock: destinationcidrblock,
	RouteTableId: routetableId
	});
	try{
		const response = await ec2Client.send(command);
		console.log(`✂️ Detached internet gateway from routetable ${routetableId}\n`);
	} catch (err) {
		console.warn(`Failed to attach gateway to routetable.`, err);
	}
}

export async function getAssociationId(ec2Client, routeTableId, subnetId) {
    try {
        const data = await ec2Client.send(new DescribeRouteTablesCommand({
            RouteTableIds: [routeTableId]
        }));

        const routeTable = data.RouteTables.find(table => table.RouteTableId === routeTableId);
        if (!routeTable) {
            console.error('Route table not found');
            return;
        }

        const association = routeTable.Associations.find(assoc => assoc.SubnetId === subnetId);
        if (!association) {
            console.error('Association not found');
            return;
        }

        return association.RouteTableAssociationId;
    } catch (err) {
        console.error(err, err.stack);
    }
}