import { mockClient } from "aws-sdk-client-mock";
import { EC2Client, CreateVpcCommand, DescribeVpcsCommand } from "@aws-sdk/client-ec2";
import { createVpc, describeVpcs, deleteVPC } from "./vpc-actions.js";
import { expectTypeOf } from 'expect-type';

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createVpc returns a vpc object", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0"
        }
    });

    const vpc = await createVpc(ec2Mock, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    });

    expect(vpc).toStrictEqual({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0"
        }
    });
})

test("Determines if describeVpcs returns a list of vpcs corresponding toinoutted vpcIds", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "abc123"
        }
    });

    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "174.0.0.0",
            "VpcId": "def456"
        }
    });

    ec2Mock.on(DescribeVpcsCommand, {
        "VpcIds": [
            "abc123",
            "def456"
        ]
    }).resolves({
        "Vpcs": [
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "172.0.0.0",
                "VpcId": "abc123"
            },
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "174.0.0.0",
                "VpcId": "def456"
            }
        ]
    });

    const vpc1 = await createVpc(ec2Mock, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    });
    const vpc2 = await createVpc(ec2Mock, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0"
    });
    const vpcList = await describeVpcs(ec2Mock, ["abc123", "def456"]);

    expect(vpcList).toStrictEqual({
        "Vpcs": [
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "172.0.0.0",
                "VpcId": "abc123"
            },
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "174.0.0.0",
                "VpcId": "def456"
            }
        ]
    });
})

test("Determines if deleteVpc returns successfully", () => {
    expect(() => deleteVPC(ec2Mock, "abc123")).not.toThrow();
})

