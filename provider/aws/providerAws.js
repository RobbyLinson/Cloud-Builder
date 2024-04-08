import { EC2Client } from "@aws-sdk/client-ec2";
import { createVpc, describeVpcs, deleteVPC, updateVpcName } from './actions/vpc-actions.js';
import { createSubnet, describeSubnets, deleteSubnet } from './actions/subnet-actions.js';
import { createInstance, describeInstances, deleteInstance } from './actions/instance-actions.js';
import { createNatGateway, describeNatGateways, deleteNatGateway } from "./actions/natgateway-actions.js";
import { createInternetGateway, describeInternetGateways, deleteInternetGateway, attachInternetGatewayToVpc, detachInternetGatewayFromVpc } from "./actions/internetgateway-actions.js";
import { createRouteTable, describeRouteTables, deleteRouteTable, attachRouteTableToGateway, detachRouteTableFromGateway, detachRouteTableFromSubnet, attachRouteTableToSubnet} from './actions/routetable-actions.js';
import { describeAllResources } from "./actions/general-actions.js";
import { checkAwsFolder, getCredentials } from './credentialsAws.js';

// State related imports
import { updateStateFile, compareCounts, reinitializeInfrastructure } from './state/state.js';
import { askUserToProceed, previewFileContent, userFileCountNumberOfResourcesByType } from './state/userFileParsers.js';
import { getResourceTypeAndIdByName, stateCountNumberOfResourcesByType } from './state/stateFileParsers.js';

async function providerAws(userId) {
	
	await checkAwsFolder(userId);
	const awsCredentials = await getCredentials(userId);
	
	const ec2Client = new EC2Client({
		region: awsCredentials.region,
		credentials: {
			accessKeyId: awsCredentials.accessKeyId,
			secretAccessKey: awsCredentials.secretAccessKey
		}
	});

    async function describeResources({
      type, resourceIds
    }) {
      switch (type) {
        case 'vpc':
          return describeVpcs(ec2Client, resourceIds);
        case 'subnet':
          return describeSubnets(ec2Client, resourceIds);
        case 'instance':
          return describeInstances(ec2Client, resourceIds);
        case 'natgateway':
          return describeNatGateways(ec2Client, resourceIds);
        case 'internetgateway':
          return describeInternetGateways(ec2Client, resourceIds);
		    case 'routetable':
          return describeRouteTables(ec2Client, resourceIds);
        case 'all': // describe all resources on ec2 client
			    return describeAllResources(ec2Client);
        default:
          return {
            error: `Unknown resource type: ${type}`
          };
      }
    }

    async function attachInternetGatewayAndVpc({
      internetgatewayId, vpcId
    }) {
      return attachInternetGatewayToVpc(ec2Client, internetgatewayId, vpcId);
    }

    async function detachInternetGatewayAndVpc({
      internetgatewayId, vpcId
    }) {
      return detachInternetGatewayFromVpc(ec2Client, internetgatewayId, vpcId);
    }

    async function attachRouteTableAndSubnet({
      routetableId, subnetId
    }) {
      return attachRouteTableToSubnet(ec2Client, routetableId, subnetId);
    }

    async function detachRouteTableAndSubnet({
      routetableId, subnetId
    }) {
      return detachRouteTableFromSubnet(ec2Client, routetableId, subnetId);
    }

    async function attachInternetGatewayAndRouteTable({
      destinationcidrblock, gatewayId, routetableId
    }) {
      return attachRouteTableToGateway(ec2Client, destinationcidrblock, gatewayId, routetableId);
    }

    async function detachInternetGatewayAndRouteTable({
      destinationcidrblock, routetableId
    }) {
      return detachRouteTableFromGateway(ec2Client, destinationcidrblock, routetableId);
    }

	async function terminateResource({type, instanceId}){
		switch (type) {
			case 'vpc':
				await deleteVPC(ec2Client, instanceId);
				break;
			case 'subnet':
				await deleteSubnet(ec2Client, instanceId);
				break;
			case 'instance':
        await deleteInstance(ec2Client, instanceId);
        break;
      case 'natgateway':
        await deleteNatGateway(ec2Client, instanceId);
        break;
      case 'internetgateway':
        await deleteInternetGateway(ec2Client, instanceId);
        break;
			case 'routetable':
				await deleteRouteTable(ec2Client, instanceId);
				break;
			default:
				return {
					error: `Unknown resource type: ${type}`
				};
		}
	}

    async function createResource({
      type,
      Name,
      ...options
    }) {
      var newId;
        
      switch (type) {
        case 'vpc':
          newId = await createVpc(ec2Client, {
            Name, ...options
          });
          break;
        case 'subnet':
          newId = await createSubnet(ec2Client, {
            Name, ...options
          });
          break;
        case 'instance':
          newId = await createInstance(ec2Client, {
            Name, ...options
          });
          break;
        case 'natgateway':
          newId = await createNatGateway(ec2Client, {
            Name, ...options
          });
          break;
        case 'internetgateway':
          newId = await createInternetGateway(ec2Client, {
            Name, ...options
          });
          break;
		    case 'routetable':
			    newId = await createRouteTable(ec2Client, {
			    	Name, ...options
			    });
			    break;
		    default:
		    	return {
		    		error: `Unknown resource type: ${type}`
		    	};
		  }
		return newId;
	}

  async function updateResource({
      type,
      id,
      name
    }){
      switch (type){
        case 'vpc':
          return updateVpcName(ec2Client, {id, name})
      }
    }


    return {
      createResource, 
      attachInternetGatewayAndVpc,
      detachInternetGatewayAndVpc,
      attachRouteTableAndSubnet,
      detachRouteTableAndSubnet,
      attachInternetGatewayAndRouteTable,
      detachInternetGatewayAndRouteTable,
      describeResources,
      terminateResource,
      updateResource,
	  state: {
		  updateStateFile,
		  compareCounts,
		  reinitializeInfrastructure,
		  askUserToProceed,
		  previewFileContent,
		  userFileCountNumberOfResourcesByType, 
		  getResourceTypeAndIdByName,
		  stateCountNumberOfResourcesByType
	  }
    };
}

export default providerAws;
