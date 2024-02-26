import providerAws from './provider/aws/providerAws.js';
import { accessKeyId, secretAccessKey } from './credentials.js'; // temporary, replace this asap

// Creation testing //

const awsProvider = await providerAws({
  region: 'eu-west-1',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

const mainVpc = await awsProvider.createResource({
  type: 'vpc',
  CidrBlock: '10.0.1.0/24',
});

console.log(mainVpc.Vpc)

// Deletes VPC right after it is created
//await awsProvider.terminateResource({
//  type: 'vpc',
//  instanceId: mainVpc.Vpc.VpcId
//})

const publicSubnet = await awsProvider.createResource({
  type: 'subnet',
  VpcId: mainVpc.Vpc.VpcId,
  CidrBlock: '10.0.1.1/24'
});

// Reading some metadata for testing.
 console.log(publicSubnet.Vpc);

// Creating an instance

const newInstance = await awsProvider.createResource({
  type: 'instance',
  SubnetId: publicSubnet.Subnet.SubnetId,
  MinCount: 1,
  MaxCount: 1,
  ImageId: 'ami-0766b4b472db7e3b9'
});


console.log(newInstance.Instances[0].InstanceId);

awsProvider.terminateResource({
  type : 'instance',
  instanceId: newInstance.Instances[0].InstanceId
});

//There must be a delay between deleting instance and deleting subnet or you will get a dependency error
setTimeout(async () => {
  await awsProvider.terminateResource({
    type: 'subnet',
    instanceId: publicSubnet.Subnet.SubnetId
  });

  // Deletes VPC right after it is created
  await awsProvider.terminateResource({
    type: 'vpc',
    instanceId: mainVpc.Vpc.VpcId
  });
}, 10000); // 10 seconds delay

// Describing testing //

// // Describe a VPC
// const vpcDescription = await awsProvider.describeResources({
// 	type: 'vpc', resourceIds: [mainVpc.Vpc.VpcId]
// });

// // Read some VPC info after describing.
// console.log(vpcDescription.Vpcs.length);
// console.log(vpcDescription.Vpcs[0].CidrBlock);

// // Describe a Subnet
// const subnetDescription = await awsProvider.describeResources({
// 	type: 'subnet', resourceIds: [publicSubnet.Subnet.SubnetId]
// });	

// // Read some Subnet info after describing.
// console.log(subnetDescription.Subnets[0].CidrBlock);

// Sending some requests with missing parameters to check error handling.
await awsProvider.createResource({
  type: 'vpc',
});
await awsProvider.createResource({
  type: 'subnet',
});
await awsProvider.createResource({
  type: 'instance',
});
