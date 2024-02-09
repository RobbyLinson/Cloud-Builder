import { EC2Client, 
    CreateVpcCommand 
} from "@aws-sdk/client-ec2";

// !!! This is just a playground for error handling !!! // 

export const createVPC = async ({
    cidrBlock, 
    ...options
}) => {

    const inputedParams = {
        input,
        dryRun: true
    }

    const command = new CreateVpcCommand(inputedParams);
    
    try {
        const { Response } = await client.send(command);
        console.log(Response);
    } catch (err) {
        console.error(err);
    }

}



