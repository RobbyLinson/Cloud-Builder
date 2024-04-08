import { mockClient } from "aws-sdk-client-mock";
import { EC2Client, RunInstancesCommand, DescribeInstancesCommand,
    TerminateInstancesCommand} from "@aws-sdk/client-ec2";
import { createInstance, describeInstances, describeInstancesWithState,
    deleteInstance } from "./instance-actions.js";

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createInstance returns an Instance object", async () => {
    ec2Mock.on(RunInstancesCommand, {
        "MaxCount": 1,
        "MinCount": 1
    }).resolves({
        "Instances": [
            {
                "InstanceId": "i-abc123"
            }
        ]
    })

    const instances = await createInstance(ec2Mock, {
        "MaxCount": 1,
        "MinCount": 1
    })

    expect(instances).toStrictEqual("i-abc123");
})

test("Determines if describeInstances returns a list of Instances corresponding to inputted InstanceIds", async () => {
    ec2Mock.on(RunInstancesCommand, {
        "MaxCount": 1,
        "MinCount": 1
    }).resolves({
        "Instances": [
            {
                "InstanceId": "i-abc123"
            }
        ]
    })

    ec2Mock.on(DescribeInstancesCommand, {
        "InstanceIds": [
            "i-abc123"
        ]
    }).resolves({
        "Instances": [
            {
                "InstanceId": "i-abc123"
            }
        ]
    })

    const instances = await createInstance(ec2Mock, {
        "MaxCount": 1,
        "MinCount": 1
    })

    const instancesList = await describeInstances(ec2Mock, [instances])

    expect(instancesList).toStrictEqual({
        "Instances": [
            {
                "InstanceId": "i-abc123"
            }
        ]
    })
})

test("Determines if describeInstancesWithState returns a list of Instances with the corresponding state", async () => {
    ec2Mock.on(DescribeInstancesCommand, {
        "Filters": [
            {
                "Name": "instance-state-name",
                "Values": [
                    "running"
                ]
            }
        ]
    }).resolves({
        "Reservations": [
            {
                "Instances": [
                    {
                        "InstanceId": "i-abc123"
                    }
                ]
            }
        ]
    })

    const instance = await describeInstancesWithState(ec2Mock, ["running"])

    expect(instance).toStrictEqual([
        {
            "InstanceId": "i-abc123"
        }
    ])
})

test("Determines if deleteInstance returns successfully", async () => {
    expect(() => deleteInstance(ec2Mock, "i-abc123")).not.toThrow();
})


