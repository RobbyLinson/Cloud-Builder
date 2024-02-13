import providerAws from './provider.js';
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