import { createVPC } from "./vpc-actions.js"

// I didn't run the code, maybe this part should be inside createVPC. 
// In Provider branch this is handled, so we don't have to worry about it.

const input = {
    CidrBlock: "12.0.0.0/16",
    // DryRun: true,
    Tags: [
        {name: "TestVPC"},
    ]
}

createVPC(input);