import { mockClient } from "aws-sdk-client-mock";
import { EC2Client, CreateNatGatewayCommand, DescribeNatGatewaysCommand,
    DeleteNatGatewayCommand} from "@aws-sdk/client-ec2";
import { createNatGateway, describeNatGateways, deleteNatGateway } from "./natgateway-actions.js"

const ec2Mock = mockClient(EC2Client);
beforeEach(() => {
    ec2Mock.reset();
})

test("Determines if createNatGateway returns a NatGateway object", async() => {
    ec2Mock.on(CreateNatGatewayCommand, {
        "SubnetId": "sub-abc123"
    }).resolves({
        "NatGateway": {
            "NatGatewayId": "nat-abc123",
            "SubnetId": "sub-abc123"
        }
    })

    const nat = await createNatGateway(ec2Mock, {
        "SubnetId": "sub-abc123"
    })

    expect(nat).toStrictEqual("nat-abc123")
})

test("Determines if descibeNatGateways returns a list of NatGateways corresponding to" +
    "inputted NatGatewaysIds", async () => {
    ec2Mock.on(CreateNatGatewayCommand, {
        "SubnetId": "sub-abc123"
    }).resolves({
        "NatGateway": {
            "NatGatewayId": "nat-abc123",
            "SubnetId": "sub-abc123"
        }
    })

    ec2Mock.on(DescribeNatGatewaysCommand, {
        "NatGatewayIds": [
            "nat-abc123"
        ]
    }).resolves({
        "NatGateways": [
            {
                "NatGatewayId": "nat-abc123",
                "SubnetId": "sub-abc123"
            }
        ]
    })

    const nat = await createNatGateway(ec2Mock, {
        "SubnetId": "sub-abc123"
    })

    const natList = await describeNatGateways(ec2Mock, [nat])

    expect(natList).toStrictEqual({
        "NatGateways": [
            {
                "NatGatewayId": "nat-abc123",
                "SubnetId": "sub-abc123"
            }
        ]
    })
})

test("Determines if deleteNatGateway returns successfully", async() => {
    expect(() => deleteNatGateway(ec2Mock, "nat-abc123")).not.toThrow()
})