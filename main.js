import providerAws from './provider.js';
import { accessKeyId, secretAccessKey } from './credentials.js'; // temporary, replace this asap

const awsProvider = await providerAws({
  region: 'eu-west-1',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

const mainVpc = awsProvider.createResource({
  type: 'vpc',
  cidrBlock: '10.0.1.0/24',
});
