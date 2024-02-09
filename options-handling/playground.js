import { ACCESS_KEY, SECRET_ACCESS_KEY } from "../credentials.js" // temporary
import { createVPC } from "./vpc-actions.js"

const ec2client = new EC2Client({
    region: 'eu-west-1',
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY 
});

const input = {
    CidrBlock: "120.0.0.0/16",
}

createVPC(input);