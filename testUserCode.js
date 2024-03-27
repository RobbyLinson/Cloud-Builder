import providerAws from './provider/aws/providerAws.js';
// Creation testing //

const awsProvider = await providerAws();


// restrictions for clb run <file> in mode 2 ( when we care about the state)
/*
  1. functions which use awsProvider are not allowed. (might be fixed later)
  2. only for loops are allowed for awsProvider usage 
*/

// ------------------
// Scenario 1

// terminateAllVpcsWithoutDependencies()

// for (let i = 1; i < 2; i++){
//   const vpc = await awsProvider.createResource({
//     type: "vpc",
//     CidrBlock: "10.0.1.0/24",
//     Name: `VPC${i}`
//   });
// }

// ------------------

// ------------------
// Scenario 2

const mainVpc = await awsProvider.createResource({
  type: 'vpc',
  CidrBlock: '10.0.1.0/24',
  Name: "MainVPC"
});

const publicSubnet = await awsProvider.createResource({
  type: 'subnet',
  VpcId: mainVpc,
  CidrBlock: '10.0.1.1/24'
});

const newInternetGateway = await awsProvider.createResource({
  type: 'internetgateway'
});

const newRouteTable = await awsProvider.createResource({
  type: 'routetable',
  VpcId: mainVpc,
});

await awsProvider.attach({
  internetgatewayId: newInternetGateway,
  vpcId: mainVpc
});

await awsProvider.associate({
  routetableId: newRouteTable,
  subnetId: publicSubnet,
});

// const newNatGateway = await awsProvider.createResource({
//   type: 'natgateway',
//   SubnetId: publicSubnet,
//   //AllocationId: 'eipalloc-0e37779e6f029dfb4',
//   ConnectivityType: 'private'
// })

// const internetgatewayDescription = await awsProvider.describeResources({
//   type: 'internetgateway',
//   resourceIds: [newInternetGateway]
// })

// console.log(internetgatewayDescription);

// await awsProvider.detach({
//   internetgatewayId: newInternetGateway,
//   vpcId: mainVpc
// });

// await awsProvider.terminateResource({
//     type: "internetgateway",
//     instanceId: newInternetGateway
// });

// const newNatGateway = await awsProvider.createResource({
//   type: 'natgateway',
//   SubnetId: publicSubnet,
//   // no AllocationId needed if ConnectivityType: 'private'
//   ConnectivityType: 'private'
// })

// const newInstance = await awsProvider.createResource({
//   type: 'instance',
//   Name: "TestInstance",
//   InstanceType: "t2.micro",
//   SubnetId: publicSubnet,
//   MinCount: 1,
//   MaxCount: 1,
//   ImageId: 'ami-0766b4b472db7e3b9'
// });

// await awsProvider.terminateResource({
//     type: "instance",
//     instanceId: newInstance
// })
// const natgatewayDescription = await awsProvider.describeResources({
//   type: 'natgateway',
//   resourceIds: [newNatGateway]
// })

// console.log(natgatewayDescription);
// await awsProvider.terminateResource({
//   type: "natgateway",
//   instanceId: newNatGateway
// })
// await awsProvider.terminateResource({
//     type: "subnet",
//     instanceId: publicSubnet
// })
// await awsProvider.terminateResource({
//   type: "vpc",
//   instanceId: mainVpc
// })
// await awsProvider.terminateResource({
//     type: "routetable",
//     instanceId: newRouteTable
// })


// ------------------

// ------------------
// User interaction with CLI


// cloud-builder create vpc VPC713 CidrBlock='10.0.1.1/24'
// cloud-builder delete VPC713

// async function terminateAllVpcsWithoutDependencies() {
//   try {
//     const allInstances = await awsProvider.describeResources({ type: 'vpc' });

//       const terminationPromises = allInstances.Vpcs.map(async (vpc) => {
//         const id = vpc.VpcId;
//         try {
//           await awsProvider.terminateResource({
//             type: 'vpc',
//             instanceId: id,
//           });

//           console.log(`Termination request for VPC ${id} submitted.`);
//         } catch (error) {
//           console.error(`Failed to terminate VPC ${id}. It might have a dependency`);
//         }
//       });

//       // Wait for all termination promises to be fulfilled
//       await Promise.all(terminationPromises);

//       console.log('All termination requests completed.');
//   } catch (error) {
//     console.error('Error fetching VPCs:', error);
//     }
// }
