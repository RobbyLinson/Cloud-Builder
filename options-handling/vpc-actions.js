import { EC2Client, CreateVpcCommand } from "@aws-sdk/client-ec2";

const client = new EC2Client({
    region: 'eu-west-1',
    credentials: {
        accessKeyId: 'AKIAVRUVPZZ2N5WKCM4Z',
        secretAccessKey: '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'
    }
});

const input = {
    CidrBlock: "120.0.0.0/16",
}

const command = new CreateVpcCommand(input);
const response = client.send(command);
console.log(response);