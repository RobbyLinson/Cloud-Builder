import { ACCESS_KEY, SECRET_ACCESS_KEY, REGION } from "../credentials.js" // temporary
import { createVPC } from "./vpc-actions.js"

// I didn't run the code, maybe this part should be inside createVPC. 
// In Provider branch this is handled, so we don't have to worry about it.
const ec2client = new EC2Client({
    region: REGION,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY 
});

const input = {
    CidrBlock: "120.0.0.0/16",
}

createVPC(input, ec2client); // I will temporarily pass the ec2client var in the function