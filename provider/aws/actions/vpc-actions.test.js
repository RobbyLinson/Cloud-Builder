import { mockClient } from "aws-sdk-client-mock";
import { EC2Client, CreateVpcCommand, DescribeVpcsCommand,
        CreateSubnetCommand, DescribeSubnetsCommand } from "@aws-sdk/client-ec2";
import { createVpc, describeVpcs, deleteVPC } from "./vpc-actions.js";
import { createSubnet, describeSubnets, deleteSubnet } from "./subnet-actions.js";

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createVpc returns a vpc object", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "TagSpecifications": [
            {
                "ResourceType": "vpc",
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": "abc123"
                    },
                ],
            },
        ],
    }).resolves({
        "Vpc": {
            "DryRun": true,
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123",
            "TagSpecifications": [
                {
                    "ResourceType": "vpc",
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": "abc123"
                        },
                    ],
                },
            ],
        }
    });

    const vpc = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    });

    expect(vpc).toStrictEqual("vpc-abc123");
})

test("Determines if describeVpcs returns a list of vpcs corresponding to inputted vpcIds", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "TagSpecifications": [
            {
                "ResourceType": "vpc",
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": "abc123"
                    },
                ],
            },
        ],
    }).resolves({
        "Vpc": {
            "DryRun": true,
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123",
            "TagSpecifications": [
                {
                    "ResourceType": "vpc",
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": "abc123"
                        },
                    ],
                },
            ],
        }
    });

    ec2Mock.on(CreateVpcCommand, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0",
        "TagSpecifications": [
            {
                "ResourceType": "vpc",
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": "def456"
                    },
                ],
            },
        ],
    }).resolves({
        "Vpc": {
            "DryRun": true,
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "174.0.0.0",
            "VpcId": "vpc-def456",
            "TagSpecifications": [
                {
                    "ResourceType": "vpc",
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": "def456"
                        },
                    ],
                },
            ],
        }
    });

    ec2Mock.on(DescribeVpcsCommand, {
        "VpcIds": [
            "vpc-abc123",
            "vpc-def456"
        ]
    }).resolves({
        "Vpcs": [
            {
                "DryRun": true,
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "172.0.0.0",
                "VpcId": "vpc-abc123",
                "TagSpecifications": [
                    {
                        "ResourceType": "vpc",
                        "Tags": [
                            {
                                "Key": "Name",
                                "Value": "abc123"
                            },
                        ],
                    },
                ],
            },
            {
                "DryRun": true,
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "174.0.0.0",
                "VpcId": "vpc-def456",
                "TagSpecifications": [
                    {
                        "ResourceType": "vpc",
                        "Tags": [
                            {
                                "Key": "Name",
                                "Value": "def456"
                            },
                        ],
                    },
                ],
            }
        ]
    });

    const vpc1 = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    });
    const vpc2 = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0",
        "Name": "def456"
    });
    const vpcList = await describeVpcs(ec2Mock,
        [vpc1, vpc2]);

    expect(vpcList).toStrictEqual({
        "Vpcs": [
            {
                "DryRun": true,
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "172.0.0.0",
                "VpcId": "vpc-abc123",
                "TagSpecifications": [
                    {
                        "ResourceType": "vpc",
                        "Tags": [
                            {
                                "Key": "Name",
                                "Value": "abc123"
                            },
                        ],
                    },
                ],
            },
            {
                "DryRun": true,
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "174.0.0.0",
                "VpcId": "vpc-def456",
                "TagSpecifications": [
                    {
                        "ResourceType": "vpc",
                        "Tags": [
                            {
                                "Key": "Name",
                                "Value": "def456"
                            },
                        ],
                    },
                ],
            }
        ]
    });
})

test("Determines if deleteVpc returns successfully", () => {
    expect(() => deleteVPC(ec2Mock, "vpc-abc123")).not.toThrow();
})