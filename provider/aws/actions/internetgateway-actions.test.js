import { mockClient } from "aws-sdk-client-mock";
import { EC2Client, CreateInternetGatewayCommand, AttachInternetGatewayCommand,
    DeleteInternetGatewayCommand, DescribeInternetGatewaysCommand, DetachInternetGatewayCommand,
    CreateVpcCommand } from "@aws-sdk/client-ec2";
import { createInternetGateway, attachInternetGatewayToVpc, detachInternetGatewayFromVpc,
    describeInternetGateways, deleteInternetGateway} from "./internetgateway-actions.js"
import { createVpc } from "./vpc-actions.js"

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createInternetGateway returns an InternetGateway object", async () => {
    ec2Mock.on(CreateInternetGatewayCommand,
        {}).resolves({
        "InternetGateway": {
            "InternetGatewayId": "igw-abc123"
        }
    })

    const igw = await createInternetGateway(ec2Mock, {});

    expect(igw).toStrictEqual("igw-abc123");
})

test("Determines if attachInternetGatewayToVpc attaches specified InternetGateway to specified Vpc", async () => {
    ec2Mock.on(CreateInternetGatewayCommand,
        {}).resolves({
        "InternetGateway": {
            "InternetGatewayId": "igw-abc123"
        }
    })

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

    ec2Mock.on(AttachInternetGatewayCommand, {
        "InternetGatewayId": "igw-abc123",
        "VpcId": "vpc-abc123"
    }).resolves({})

    const vpc = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    })

    const igw = await createInternetGateway(ec2Mock, {})

    expect(() => attachInternetGatewayToVpc(ec2Mock, igw, vpc)).not.toThrow();
})

test("Determines if detachInternetGatewayFromVpc detaches specified InternetGateway from specified Vpc", async () => {
    ec2Mock.on(CreateInternetGatewayCommand,
        {}).resolves({
        "InternetGateway": {
            "InternetGatewayId": "igw-abc123"
        }
    })

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

    ec2Mock.on(AttachInternetGatewayCommand, {
        "InternetGatewayId": "igw-abc123",
        "VpcId": "vpc-abc123"
    }).resolves({})

    ec2Mock.on(DetachInternetGatewayCommand, {
        "InternetGatewayId": "igw-abc123",
        "VpcId": "vpc-abc123"
    }).resolves({})

    const vpc = await createVpc(ec2Mock, {
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    })

    const igw = await createInternetGateway(ec2Mock, {})

    expect(() => attachInternetGatewayToVpc(ec2Mock, igw, vpc)).not.toThrow();
    expect(() => detachInternetGatewayFromVpc(ec2Mock, igw, vpc)).not.toThrow();
})

test("Determines if describeInternetGateways reutrns a list of InternetGateways corresponding to" +
    "inputted InternetGatewayIds", async () => {
    ec2Mock.on(CreateInternetGatewayCommand,
        {}).resolves({
        "InternetGateway": {
            "InternetGatewayId": "igw-abc123"
        }
    })

    ec2Mock.on(DescribeInternetGatewaysCommand, {
        "InternetGatewayIds": [
            "igw-abc123"
        ]
    }).resolves({
        "InternetGateways": [
            {
                "InternetGatewayId": "igw-abc123"
            }
        ]
    })

    const igw = await createInternetGateway(ec2Mock, {})

    const igwList = await describeInternetGateways(ec2Mock, [igw])

    expect(igwList).toStrictEqual({
        "InternetGateways": [
            {
                "InternetGatewayId": "igw-abc123"
            }
        ]
    })
})

test("Determines if deleteInternetGateway returns successfully", async() => {
    expect(() => deleteInternetGateway(ec2Mock, "igw-abc123")).not.toThrow();
})