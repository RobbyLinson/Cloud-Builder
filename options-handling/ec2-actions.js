import {
    DescribeInstancesCommand,
    // DescribeKeyPairsCommand,
    // DescribeSecurityGroupsCommand, // have no idea why it is important for now
    // DisassociateAddressCommand,
    EC2Client,
    // paginateDescribeImages,
    // paginateDescribeInstanceTypes, // have no idea why it is important for now
    // ReleaseAddressCommand,
    RunInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand,
    TerminateInstancesCommand,
    waitUntilInstanceStatusOk,
    waitUntilInstanceStopped,
    waitUntilInstanceTerminated
} from "@aws-sdk/client-ec2";

// it's a slightly modified code from https://github.com/awsdocs/aws-doc-sdk-examples/tree/main/javascriptv3/example_code/ec2/actions
// I guess we may use it as a starting point for async functions in provider like createInstance, createSubnet... from Appendix 2: AWS Provider Example Code

const ec2Client = new EC2Client();

// I'm not sure if it can describe all possible types of instances (e.g ec2, vpc, subnet..)
export const describeInstance = async (instanceId) => {
    const command = new DescribeInstancesCommand({
        InstanceIds: [instanceId]
    });

    const { Reservations } = await ec2Client.send(command);
    return Reservations[0].Instances[0];
};

// original name from documentation is runInstance, but as i understood, purpose is a creation of ec2
export const createInstance = async ({
    keyPairName,
    securityGroupId,
    imageId,
    instanceType,
    subnetId,               // Optional: Subnet ID
    iamInstanceProfile,     // Optional: IAM Instance Profile
    userData,               // Optional: User Data
    blockDeviceMappings,    // Optional: Block Device Mappings
    tags                    // Optional: Tags
}) => {

    // this is an example of handling the optional output
    const includedParams = {
        KeyName: keyPairName,
        SecurityGroupIds: [securityGroupId],
        ImageId: imageId,
        InstanceType: instanceType,
        MinCount: 1,
        MaxCount: 1
    };

    // Include optional parameters if provided
    if (subnetId) includedParams = { ...includedParams, SubnetId: subnetId };
    if (iamInstanceProfile) includedParams = { ...includedParams, IamInstanceProfile: iamInstanceProfile };
    if (userData) includedParams = { ...includedParams, UserData: userData };
    if (blockDeviceMappings) includedParams = { ...includedParams, BlockDeviceMappings: [blockDeviceMappings] };
    if (tags) includedParams = { ...includedParams, TagSpecifications: [tags] };

    //end


    const command = new RunInstancesCommand(includedParams);

    const { Instances } = await ec2Client.send(command);
    await waitUntilInstanceStatusOk(
        { client: ec2Client },
        { InstanceIds: [Instances[0].InstanceId] }
    );
    return Instances[0].InstanceId;
};

// should start running instances
export const startInstance = async (instanceId) => {
    const command = new StartInstancesCommand({
        // Use DescribeInstancesCommand to find InstanceIds
        InstanceIds: [instanceId]
    });

    try {
        const { StartingInstances } = await client.send(command);
        const instanceIdList = StartingInstances.map(
            (instance) => ` • ${instance.InstanceId}`
        );
        console.log("Starting instances:");
        console.log(instanceIdList.join("\n"));
    } catch (err) {
        console.error(err);
    }
};

// shuold restart running instances
export const restartInstance = async (instanceId) => {
    console.log("Stopping instance.");
    await stopInstance(instanceId);
    console.log("Instance stopped.");
    console.log("Starting instance.");
    const { PublicIpAddress } = await startInstance(instanceId);
    return PublicIpAddress;
};

// should stop the intance without terminating
export const stopInstance = async (instanceId) => {
    const command = new StopInstancesCommand({ InstanceIds: [instanceId] });
    await ec2Client.send(command);
    await waitUntilInstanceStopped(
        { client: ec2Client },
        { InstanceIds: [instanceId] }
    );
};

// should delete an instance (maybe a better name is deleteInstance?)
export const terminateInstance = async (instanceId) => {
    const command = new TerminateInstancesCommand({
        InstanceIds: [instanceId]
    });

    try {
        await ec2Client.send(command);
        await waitUntilInstanceTerminated(
            { client: ec2Client },
            { InstanceIds: [instanceId] }
        );
        console.log(`🧹 Instance with ID ${instanceId} terminated.\n`);
    } catch (err) {
        console.warn(`Failed to terminate instance ${instanceId}.`, err);
    }
};
