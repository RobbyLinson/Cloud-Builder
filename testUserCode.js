import providerAws from './provider/aws/providerAws.js';
// Creation testing //

const awsProvider = await providerAws("default");

// restrictions for clb run <file> in mode 2 ( when we care about the state)
/*
  1. functions which use awsProvider are not allowed. (might be fixed later)
  2. only single for loops are allowed for awsProvider usage 
*/
// ------------------
// Scenario 1

// terminateAllVpcsWithoutDependencies()

// for (let i = 1; i < 3; i++){
//   const vpc = await awsProvider.createResource({
//     type: "vpc",
//     CidrBlock: "10.0.1.0/24",
//     Name: `VPC${i}`
//   });
// }

// ------------------

// ------------------
// Scenario 2

// const mainVpc = await awsProvider.createResource({
//   type: 'vpc',
//   CidrBlock: '10.0.1.0/24',
//   Name: "MainVPC"
// });

// const publicSubnet = await awsProvider.createResource({
//   type: 'subnet',
//   VpcId: mainVpc,
//   CidrBlock: '10.0.1.1/24'
// });

// const newInternetGateway = await awsProvider.createResource({
//   type: 'internetgateway'
// });

// const newRouteTable = await awsProvider.createResource({
//   type: 'routetable',
//   VpcId: mainVpc,
// });

// await awsProvider.attachInternetGatewayAndVpc({
//   internetgatewayId: newInternetGateway,
//   vpcId: mainVpc
// });

// await awsProvider.attachRouteTableAndSubnet({
//   routetableId: newRouteTable,
//   subnetId: publicSubnet,
// });

// const newNatGateway = await awsProvider.createResource({
//   type: 'natgateway',
//   SubnetId: subnetId,
//   //AllocationId: 'eipalloc-0e37779e6f029dfb4',
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

// console.log(natgatewayDescription);
// await awsProvider.terminateResource({
//   type: "natgateway",
//   instanceId: "nat-09c0160581dd882ed"
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
