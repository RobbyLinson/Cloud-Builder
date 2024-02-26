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
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123"
        }
    });

    const vpc = await createVpc(ec2Mock, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    });

    expect(vpc).toStrictEqual({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123"
        }
    });
})

test("Determines if describeVpcs returns a list of vpcs corresponding to inputted vpcIds", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123"
        }
    });

    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "174.0.0.0",
            "VpcId": "vpc-def456"
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
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "172.0.0.0",
                "VpcId": "vpc-abc123"
            },
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "174.0.0.0",
                "VpcId": "vpc-def456"
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
    const vpcList = await describeVpcs(ec2Mock,
        [vpc1.Vpc.VpcId, vpc2.Vpc.VpcId]);

    expect(vpcList).toStrictEqual({
        "Vpcs": [
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "172.0.0.0",
                "VpcId": "vpc-abc123"
            },
            {
                "AmazonProvidedIpv6CidrBlock": true,
                "CidrBlock": "174.0.0.0",
                "VpcId": "vpc-def456"
            }
        ]
    });
})

test("Determines if deleteVpc returns successfully", () => {
    expect(() => deleteVPC(ec2Mock, "vpc-abc123")).not.toThrow();
})

test("Determines if createSubnet returns a subnet object", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123"
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
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    });
    const subnet = await createSubnet(ec2Mock, {
        "CidrBlock": "172.0.0.0",
        "VpcId": vpc.Vpc.VpcId
    })
    expect(subnet).toStrictEqual({
        "Subnet": {
            "AvailabilityZone": "eu-north-1",
            "CidrBlock": "172.0.0.0",
            "SubnetId": "subnet-abc123",
            "VpcId": "vpc-abc123"
        }
    })
})

test("Determines if describeSubnets returns a list of subnets corresponding to inputted subnetIds", async () => {
    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "172.0.0.0",
            "VpcId": "vpc-abc123"
        }
    });

    ec2Mock.on(CreateVpcCommand, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0"
    }).resolves({
        "Vpc": {
            "AmazonProvidedIpv6CidrBlock": true,
            "CidrBlock": "174.0.0.0",
            "VpcId": "vpc-def456"
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
    });

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
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    });
    const vpc2 = await createVpc(ec2Mock, {
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "174.0.0.0"
    });
    const subnet1 = await createSubnet(ec2Mock, {
        "CidrBlock": "172.0.0.0",
        "VpcId": vpc1.Vpc.VpcId
    });
    const subnet2 = await createSubnet(ec2Mock, {
        "CidrBlock": "174.0.0.0",
        "VpcId": vpc2.Vpc.VpcId
    });
    const subnetList = await describeSubnets(ec2Mock,
        [subnet1.Subnet.SubnetId, subnet2.Subnet.SubnetId]);
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



