import { EC2Client, 
    CreateVpcCommand 
} from "@aws-sdk/client-ec2";

const ec2client = new EC2Client();

const input = {
    CidrBlock: "120.0.0.0/16",
}

export const createVPC = async ({
    cidrBlock, 
    amazonProvidedIpv6CidrBlock, // optional
    dryRun // optional
}) => {
    
    const inputedParams = {
        CidrBlock: cidrBlock
    }

    const command = new CreateVpcCommand(inputedParams);
    
    try {
        const { Response } = await client.send(command);
        console.log(Response);
    } catch (err) {
        console.error(err);
    }

}



