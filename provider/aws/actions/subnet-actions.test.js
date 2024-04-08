import {mockClient} from "aws-sdk-client-mock";
import {CreateSubnetCommand, CreateVpcCommand, DescribeSubnetsCommand, EC2Client} from "@aws-sdk/client-ec2";
import {createVpc} from "./vpc-actions.js";
import {createSubnet, deleteSubnet, describeSubnets} from "./subnet-actions.js";

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createSubnet returns a subnet object", async () => {
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

    const vpc = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    });
    const subnet = await createSubnet(ec2Mock, {
        "CidrBlock": "172.0.0.0",
        "VpcId": vpc
    })
    expect(subnet).toStrictEqual("subnet-abc123")
})

test("Determines if describeSubnets returns a list of subnets corresponding to inputted subnetIds", async () => {
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

    ec2Mock.on(CreateSubnetCommand, {
        "CidrBlock": "174.0.0.0",
        "VpcId": "vpc-def456"
    }).resolves({
        "Subnet": {
            "AvailabilityZone": "eu-north-1",
            "CidrBlock": "174.0.0.0",
            "SubnetId": "subnet-def456",
            "VpcId": "vpc-def456"
        }
    });

    ec2Mock.on(DescribeSubnetsCommand, {
        SubnetIds: [
            "subnet-abc123",
            "subnet-def456"
        ]
    }).resolves({
        Subnets: [
            {
                "AvailabilityZone": "eu-north-1",
                "CidrBlock": "172.0.0.0",
                "SubnetId": "subnet-abc123",
                "VpcId": "vpc-abc123"
            },
            {
                "AvailabilityZone": "eu-north-1",
                "CidrBlock": "174.0.0.0",
                "SubnetId": "subnet-def456",
                "VpcId": "vpc-def456"
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
    const subnet1 = await createSubnet(ec2Mock, {
        "CidrBlock": "172.0.0.0",
        "VpcId": vpc1
    });
    const subnet2 = await createSubnet(ec2Mock, {
        "CidrBlock": "174.0.0.0",
        "VpcId": vpc2
    });
    const subnetList = await describeSubnets(ec2Mock,
        [subnet1, subnet2]);
    expect(subnetList).toStrictEqual({
        Subnets: [
            {
                "AvailabilityZone": "eu-north-1",
                "CidrBlock": "172.0.0.0",
                "SubnetId": "subnet-abc123",
                "VpcId": "vpc-abc123"
            },
            {
                "AvailabilityZone": "eu-north-1",
                "CidrBlock": "174.0.0.0",
                "SubnetId": "subnet-def456",
                "VpcId": "vpc-def456"
            }
        ]
    });
})

test("Determines if deleteSubnet returns successfully", () => {
    expect(() => deleteSubnet(ec2Mock, "subnet-abc123")).not.toThrow();
})