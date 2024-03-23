import { describeVpcs } from "./vpc-actions.js";
import { describeSubnets } from "./subnet-actions.js";
import { describeInstancesWithState } from "./instance-actions.js";
import { describeNatGateways } from "./natgateway-actions.js";

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
        allResources['natGateways'] = natGateways.NatGateways;

        return allResources;
    } catch (err) {
        console.error(`Failed to describe all resources.`, err);
        return {};
    }
}