import providerAws from './provider/aws/providerAws.js';
import { accessKeyId, secretAccessKey } from './credentials.js'; // temporary, replace this asap

const awsProvider = await providerAws({
  region: 'eu-west-1',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

const mainVpc = await awsProvider.createResource({
  type: 'vpc',
  CidrBlock: '10.0.1.0/24',
});

const publicSubnet = await awsProvider.createResource({
  type: 'subnet',
  VpcId: mainVpc.Vpc.VpcId,
  CidrBlock: '10.0.1.1/24'
});

// Reading some metadata for testing.
console.log(publicSubnet.$metadata.attempts);

// Creating an instance

const newInstance = await awsProvider.createResource({
  type: 'instance',
  SubnetId: publicSubnet.Subnet.SubnetId,
  MinCount: 1,
  MaxCount: 1,
  ImageId: 'ami-0766b4b472db7e3b9'
});
/*
// Describe an instance
const description = await awsProvider.describeInstances(
	[newInstance.Instances[0].InstanceId]
);
*/
// Print some data from described instance.
//console.log(description.Reservations[0].OwnerId);

