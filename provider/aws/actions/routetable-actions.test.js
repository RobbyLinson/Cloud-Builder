import { mockClient } from "aws-sdk-client-mock";
import {
    CreateRouteTableCommand, DescribeRouteTablesCommand, AssociateRouteTableCommand,
    CreateVpcCommand, EC2Client, CreateSubnetCommand } from "@aws-sdk/client-ec2";
import { createRouteTable, describeRouteTables, deleteRouteTable,
    attachRouteTable } from "./routetable-actions.js";
import { createVpc } from "./vpc-actions.js";
import { createSubnet } from "./subnet-actions.js";

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createRouteTable returns a RouteTable object", async () => {
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
    })

    ec2Mock.on(CreateRouteTableCommand, {
        "VpcId": "vpc-abc123"
    }).resolves({
        "RouteTable": {
            "RouteTableId": "rtb-abc123",
            "VpcId": "vpc-abc123"
        }
    })

    const vpc = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    })

    const rtb = await createRouteTable(ec2Mock, {
        "VpcId": vpc
    })

    expect(rtb).toStrictEqual("rtb-abc123")
})

test("Determines if describeRouteTables returns a list of RoouteTables corresponding to " +
    "inputted RouteTableIds", async () => {
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
    })

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
    })

    ec2Mock.on(CreateRouteTableCommand, {
        "VpcId": "vpc-abc123"
    }).resolves({
        "RouteTable": {
            "RouteTableId": "rtb-abc123",
            "VpcId": "vpc-abc123"
        }
    })

    ec2Mock.on(CreateRouteTableCommand, {
        "VpcId": "vpc-def456"
    }).resolves({
        "RouteTable": {
            "RouteTableId": "rtb-def456",
            "VpcId": "vpc-def456"
        }
    })

    ec2Mock.on(DescribeRouteTablesCommand, {
        "RouteTableIds": [
            "rtb-abc123",
            "rtb-def456"
        ]
    }).resolves({
        "RouteTables": [
            {
                "RouteTableId": "rtb-abc123",
                "VpcId": "vpc-abc123"
            },
            {
                "RouteTableId": "rtb-def456",
                "VpcId": "vpc-def456"
            }
        ]
    })

    const vpc1 = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    })

    const vpc2 = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0",
        "Name": "def456"
    })

    const rtb1 = await createRouteTable(ec2Mock, {
        "VpcId": vpc1
    })

    const rtb2 = await createRouteTable(ec2Mock, {
        "VpcId": vpc2
    })

    const rtbList = await describeRouteTables(ec2Mock, [rtb1, rtb2])

    expect(rtbList).toStrictEqual({
        "RouteTables": [
            {
                "RouteTableId": "rtb-abc123",
                "VpcId": "vpc-abc123"
            },
            {
                "RouteTableId": "rtb-def456",
                "VpcId": "vpc-def456"
            }
        ]
    })
})

test("Determines if deleteRouteTable returns successfully", () => {
    expect(() => deleteRouteTable(ec2Mock, "rtb-abc123")).not.toThrow();
})

test("Determines if attachRouteTable attaches specified rtb to specified subnet", async () => {
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
    })

    ec2Mock.on(CreateSubnetCommand, {
        "CidrBlock": "172.0.0.0",
        "VpcId": "vpc-abc123"
    }).resolves({
        "Subnet": {
            "AvailabilityZone": "eu-north-1",
            "CidrBlock": "172.0.0.0",
            "SubnetId": "subnet-abc123",
            "VpcId": "vpc-abc123"
        }
    })

    ec2Mock.on(CreateRouteTableCommand, {
        "VpcId": "vpc-abc123"
    }).resolves({
        "RouteTable": {
            "RouteTableId": "rtb-abc123",
            "VpcId": "vpc-abc123"
        }
    })

    ec2Mock.on(AssociateRouteTableCommand, {
        "RouteTableId": "rtb-abc123",
        "SubnetId": "subnet-abc123"
    }).resolves({
        "AssociationId": "rtbassoc-abc123"
    })

    const vpc = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    })

    const subnet = await createSubnet(ec2Mock, {
        "CidrBlock": "172.0.0.0",
        "VpcId": vpc
    })

    const rtb = await createRouteTable(ec2Mock, {
        "VpcId": vpc
    })

    expect(() => attachRouteTable(ec2Mock, rtb, subnet)).not.toThrow();
})