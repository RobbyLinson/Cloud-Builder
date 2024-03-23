# Cloud Builder

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Outline of Approach](#outline-of-approach)
  - [Providers](#providers)
  - [Resources](#resources)
  - [State](#state)
- [Appendix 1: User Code Outline](#appendix-1-user-code-outline)
- [Appendix 2: AWS Provider Example Code](#appendix-2-aws-provider-example-code)
- [Appendix 3: References](#appendix-3-references)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

The proposed Cloud Builder is a tool to create cloud infrastructure from code.

Tools like Terraform and Cloudformation, while very useful for building cloud infrastructure
can be limiting because of the way they approach the process. They use a declarative
(as opposed to a procedural) approach. This works well for lots of simple cases but falls down
when you need parts of the build to be conditional or iterative. These are procedural features
and don't fit well in declarative definitions. Terraform and Cloudformation language constructs
for dealing with these operations feel like an afterthought and the constructs are cumbersome
and error prone. Unlike these declarative pseudo-languages, commonly used programming languages
support such functionality in a natural and familiar way. Programmers feel much more comfortable
with Javascript (or other programming language).

AWS introduced CDK which does use Javascript or Typescript (and also supports Python). However,
instead of creating the infrastructure directly, it creates Cloudformation templates and then runs
Cloudformation. Because it is operating indirectly, it does a poor job of telling the user what's
going on and in error handling (because it doesn't know). As a result, it offers some improvements
and some disimprovements versus the direct declarative approach.

We think it would be interesting to experiment with creating a tool that allows the creation of
infrastructure in code.

## Outline of Approach

Terraform is an open source project and the code seems to be well structured and documented. It
is written in Go. We can use it as a reference and borrow some ideas from the approach.

Because we do not intend to introduce our own language, we think an interpreted language would be a good
choice. The framework would be provided as one or more libraries that can be consumed by the user
in their own code. The user's own code would define their specific infrastructure.

### Providers

Terraform uses the concept of providers to define the cloud services that it can interact with and
we think this is a good approach. In the initial implementation, we would focus on AWS and would
only have one provider but it makes sense to design the framework to support multiple providers.

The framework would provide a `provider`creation function that would accept an options object and
return a provider object (or Error). The options object would contain the credentials and other information
needed to interact with the cloud service. The provider object would provide functions to create
various cloud resources.

The framework would define the provider interface and providers would be implemented as separate
packages.

### Resources

Terraform uses the concept of resources to define the cloud resources that it will create with and
we also like this approach. Providers would provide functions to create resources. The framework would
define an extensible resource interface.

### State

Apart from creating an initial set of resources, the framework would also need to be able to
manage future changes to the infrastructure. This would require the framework to maintain state, as
it will not always possible to determine the current state of the infrastructure from the cloud
services. When modifying infrastructure, the framework would need to compare the current state with
the desired state, as described in the code, and determine what changes the need to be made.

Again, Terraform provides a good reference for this. It maintains a state file that contains the
current state of the infrastructure and it's state management design is well documented (see references).

## Appendix 1: User Code Outline
Below, we outline a rudimentary example of how a user might use the framework to create infrastructure.

```javascript
import { provider as providerAws } from 'cloud-builder-aws';

const awsProvider = providerAws({
  region: 'eu-west-1',
  accessKeyId: '...',
  secretAccessKey: '...'
  ....
})

const mainVpc = awsProvider.createResource({
  type: 'vpc',
  name: 'my-vpc',
  cidrBlock: ',
  ...
});

const publicSubnet = awsProvider.createResource({
  type: 'subnet',
  name: 'my-public-subnet',
  mainVpc,
  cidrBlock: '...',
  ...
}); 

const webServerInstance = awsProvider.createResource({
  type: 'instance',
  name: 'my-web-server',
  subnet: publicSubnet,
  imageId: '...',
  ...
});

const infrastructure = await awsProvider.createInfrastructure({
  name: 'my-infrastructure',
  resources: [
    mainVpc,
    publicSubnet,
    webServerInstance
  ]
});
if (infrastructure.error) {
  console.log('Error creating infrastructure: ', infrastructure.error);
} else {
  console.log('Infrastructure created successfully');
  console.log(`Web server IP address: ${webServerInstance.ipAddress}`);
}
```

## Appendix 2: AWS Provider Example Code
  
```javascript
// This a rudimentary skeleton of what the provider code might look like
import aws from 'aws-sdk';
import { EC2Client, CreateVpcCommand } from "@aws-sdk/client-ec2"; 


async function providerAws({
  region,
  accessKeyId,
  secretAccessKey
}) {

  async function() createVpc({
    name,
    cidrBlock,
    ...options
  }) {
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    const command = new CreateVpcCommand({
      CidrBlock: cidrBlock
    });
    const response = await ec2Client.send(command);
    return {
      id: response.Vpc.VpcId
    };
  }

  async function createSubnet({
    name,
    mainVpc,
    cidrBlock,
    ...options
  }) {
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    const command = new CreateSubnetCommand({
      VpcId: mainVpc.id,
      CidrBlock: cidrBlock
    });
    const response = await ec2Client.send(command);
    return {
      id: response.Subnet.SubnetId
    };
  }

  async function createInstance({
    name,
    subnet,
    imageId,
    ...options
  }) {
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    const command = new CreateInstanceCommand({
      SubnetId: subnet.id,
      ImageId: imageId
    });
    const response = await ec2Client.send(command);
    return {
      id: response.Instance.InstanceId,
      ipAddress: response.Instance.PublicIpAddress
    };
  }

  async function createResource({
    type,
    name,
    ...options
  }) {
    switch (type) {
      case 'vpc':
        return createVpc({
          name,
          ...options
        });
      case 'subnet':
        return createSubnet({
          name,
          ...options
        });
      case 'instance':
        return createInstance({
          name,
          ...options
        });
      default:
        return {
          error: `Unknown resource type: ${type}`
        };
    }
  }

  return {
    createResource,    
  };
}

export default providerAws;
```

## Appendix 3: References

[Terraform Core Architecture Summary](https://github.com/hashicorp/terraform/blob/main/docs/architecture.md)

[AWS Javascript SDK Introduction](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/introduction)

[AWS SDK example: CreateVPCCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/CreateVpcCommand/)
