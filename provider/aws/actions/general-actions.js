import { describeVpcs, deleteVPC } from "./vpc-actions.js";
import { describeSubnets, deleteSubnet } from "./subnet-actions.js";
import { describeInstancesWithState, deleteInstance } from "./instance-actions.js";
import { describeNatGateways, deleteNatGateway } from "./natgateway-actions.js";
import { describeInternetGateways, deleteInternetGateway, detachInternetGatewayFromVpc } from "./internetgateway-actions.js";
import { describeRouteTables, deleteRouteTable, detachRouteTableFromSubnet } from "./routetable-actions.js";
import fs from 'fs';

export async function describeAllResources(ec2Client) {
  try {
    const allResources = {};

    // Describe VPCs
    const vpcs = await describeVpcs(ec2Client);
    allResources['vpcs'] = vpcs.Vpcs;

    // Describe Subnets
    const subnets = await describeSubnets(ec2Client);
    allResources['subnets'] = subnets.Subnets;

    // Describe Instances
    const instances = await describeInstancesWithState(ec2Client, ['pending', 'running']);
    allResources['instances'] = instances;

    // Describe NAT Gateways
    const natGateways = await describeNatGateways(ec2Client);

    natGateways.NatGateways = natGateways.NatGateways.filter(
      natGateway => natGateway.State === "available" || natGateway.State === "pending")

    allResources['natGateways'] = natGateways.NatGateways || [];

    const internetGateways = await describeInternetGateways(ec2Client);
    allResources['internetGateways'] = internetGateways.InternetGateways;

    const routeTables = await describeRouteTables(ec2Client);
    allResources['routeTables'] = routeTables.RouteTables;

    return allResources;
  } catch (err) {
    console.error(`Failed to describe all resources.`, err);
    return {};
  }
}

export async function terminateAllResources(ec2Client){
  try {
    if (fs.existsSync('state.json')) {
      const terminationOrder = [
        "natGateways",
        "internetGateways",
        "instances",
        "subnets",
        "routeTables",
        "vpcs"
      ];

      // Describe all resources from state.json
      const allResources = JSON.parse(fs.readFileSync('state.json'));

      // Loop through the termination order and call the termination function for each resource type
      for (const resourceType of terminationOrder) {
        const resources = allResources.resources[resourceType];
        if (resources && resources.length > 0) {
          for (const resource of resources) {
            // Call the corresponding termination function based on resource type
            switch (resourceType) {
              case "internetGateways":
                if(resource.Attachments[0] != null){
                  await detachInternetGatewayFromVpc(ec2Client, resource.InternetGatewayId, resource.Attachments[0].VpcId);
                }
                await deleteInternetGateway(ec2Client, resource.InternetGatewayId);
                break;
              case "natGateways":
                await deleteNatGateway(ec2Client, resource.NatGatewayId);
                break;
              case "instances":
                await deleteInstance(ec2Client, resource.InstanceId);
                break;
              case "subnets":
                await deleteSubnet(ec2Client, resource.SubnetId);
                break;
              case "routeTables":
                
                if(resource.Associations && resource.Associations.length != 0 && resource.Associations[0].SubnetId != null){
                  await detachRouteTableFromSubnet(ec2Client, resource.RouteTableId, resource.Associations[0].SubnetId);
                }
                
                if(resource.Associations && resource.Associations.length != 0 && resource.Associations[0].Main){
                  //skipping deletion of routetables which are automatically created when creating a vpc
                }else{
                  await deleteRouteTable(ec2Client, resource.RouteTableId);
                }
                break;
              case "vpcs":
                await deleteVPC(ec2Client, resource.VpcId);
                break;
              default:
                console.error(`Unknown resource type: ${resourceType}`);
                break;
            }
          }
        }
      }

    } else {
      console.error("State file is not found");
    }
  } catch (err) {
    console.error(`Failed to delete everything.`, err)
  }
}