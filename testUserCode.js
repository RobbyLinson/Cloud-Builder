import providerAws from './provider/aws/providerAws.js';
import { accessKeyId, secretAccessKey } from './credentials.js'; // temporary, replace this asap
// Creation testing //

const awsProvider = await providerAws({
  region: 'eu-west-1',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  stateFile: process.cwd() + '/cli/instances.json'
});

// // ------------------
// // Scenario 1

// terminateAllVpcsWithoutDependencies()

// for (let i = 0; i < 1; i++){
//   const vpc = await awsProvider.createResource({
//     type: "vpc",
//     CidrBlock: "10.0.1.0/24",
//     Name: `VPC${i}`
//   });

//   const id = vpc.Vpc.VpcId;
//   console.log(id)
//   // await new Promise((resolve) => setTimeout(resolve, 1000)); 

//   await awsProvider.updateResource({type: 'vpc', id: id, name: "NewTag"});
// }


// ------------------

// ------------------
// Scenario 2

const mainVpc = await awsProvider.createResource({
  type: 'vpc',
  Name: "MainVPC",
  CidrBlock: '10.0.1.0/24'
});


const publicSubnet = await awsProvider.createResource({
  type: 'subnet',
  Name: 'privateSub',
  VpcId: mainVpc,
  CidrBlock: '10.0.1.1/24'
});

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

await awsProvider.terminateResource({
    type: "subnet",
    instanceId: publicSubnet
})
await awsProvider.terminateResource({
  type: "vpc",
  instanceId: mainVpc
})


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
//           console.error(`Failed to terminate VPC ${id}. It might have a dependecy`);
//         }
//       });

//       // Wait for all termination promises to be fulfilled
//       await Promise.all(terminationPromises);

//       console.log('All termination requests completed.');
//   } catch (error) {
//     console.error('Error fetching VPCs:', error);
//     }
// }