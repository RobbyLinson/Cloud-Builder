import creds from "../credentials.js" // temporary
const { ACCESS_KEY, SECRET_ACCESS_KEY, REGION } = creds;

import { 
    EC2Client,
    CreateVpcCommand 
} from "@aws-sdk/client-ec2";

// !!! This is just a playground for error handling !!! // 

export const createVPC = async ({
    ...options
}) => { 

    const ec2Client = new EC2Client({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY
      }
    });

    // validates input object
    const validatedOpt = validateVPCOptions({...options})
    try {
        // creates VPC
        const command = new CreateVpcCommand(validatedOpt);

        // response contain details of created VPC
        const response = await ec2Client.send(command);
        console.log(response.Vpc);
    } catch (err) {
        console.error(err);
    }
}

// must be decoupled.
// Validates input for CreateVpcOptions
// Returns a validated and modified object to match https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/CreateVpcCommand/ 
const validateVPCOptions = ({ ...input }) => {
    
    // list of expected inputs
    const expectedParams = [
      "DryRun",
      "CidrBlock",
      "Ipv4IpamPoolId",
      "Ipv4NetmaskLength",
      "AmazonProvidedIpv6CidrBlock",
      "Ipv6Pool",
      "Ipv6CidrBlock",
      "Ipv6IpamPoolId",
      "Ipv6NetmaskLength",
      "Ipv6CidrBlockNetworkBorderGroup",
      "InstanceTenancy",
      "Tags",
    ];
    
    // list of inputs which don't match any known expected input, it is also case sensitive
    const unexpectedParams = Object.keys(input).filter((param) => !expectedParams.includes(param));
    
    if (unexpectedParams.length > 0) {
      throw new Error(`Unexpected parameter(s): ${unexpectedParams.join(", ")}`);
    }
  
    
   
    // For error handling we have to ask John: 
    // What types of errors you ideally would like to be caught?
    // And also where they might appear: on what level?
  
    // A line below might not be necessary, as AWS has pretty good error handling. 
    const validatedInput = validateVPCtypes({...input});
  
    // Tags list type validation. This makes it easier to add a tag to the instance
    // After the validation it also ensures the input matches
    // expected structure for CreateVpcCommand function input
    if (validatedInput.hasOwnProperty("Tags")) {
      const tagList = validatedInput.Tags;
      if (!Array.isArray(tagList)) {
        throw new Error("Tags must be an array");
      }
  
      tagList.forEach((tag, index) => {
        if (typeof tag !== "object" || tag === null) {
          throw new Error(`Tag at index ${index} must be an object`);
        }
  
        const tagName = Object.keys(tag)[0];
        const tagValue = tag[tagName];
  
        if (typeof tagName !== "string" || typeof tagValue !== "string") {
          throw new Error(`Tag key and value at index ${index} must be strings`);
        }
      });
  
      // Automatically create TagSpecifications
      validatedInput.TagSpecifications = tagList.map((tag) => ({
        ResourceType: "vpc",
        Tags: [
          {
            Key: Object.keys(tag)[0],
            Value: tag[Object.keys(tag)[0]],
          },
        ],
      }));
  
      // Remove the individual Tags property as it's no longer needed
      delete validatedInput.Tags;
    }
  
    return validatedInput;
};

const validateVPCtypes = ({ ...input }) => {
   // DryRun type validation
   if (input.hasOwnProperty("DryRun") && typeof input.DryRun !== "boolean") {
    throw new Error("DryRun must be a boolean");
  }

  // CidrBlock type validation
  if (input.hasOwnProperty("CidrBlock") && typeof input.CidrBlock !== "string") {
    throw new Error("CidrBlock must be string");
  }

  // not sure if we have to include regEx test for CIDR
  // if (!/^(\d{1,3}\.){3}\d{1,3}\/(0|[1-9]|1[0-9]|2[0-4])$/.test(input.CidrBlock)) {
  //   throw new Error("Invalid CIDR block format");
  // }

  // Ipv4IpamPoolId type validation
  if (
    input.hasOwnProperty("Ipv4IpamPoolId") &&
    typeof input.Ipv4IpamPoolId !== "string"
  ) {
    throw new Error("Ipv4IpamPoolId must be a string");
  }

  // Ipv4NetmaskLength type validation
  if (
    input.hasOwnProperty("Ipv4NetmaskLength") &&
    typeof input.Ipv4NetmaskLength !== "number"
  ) {
    throw new Error("Ipv4NetmaskLength must be a number");
  }

  // -------------------------------------------------- //
  // !!! Ipv6 related validation is skipped for now !!! //
  // -------------------------------------------------- //

  // InstanceTenancy type validation
  if (
    input.hasOwnProperty("InstanceTenancy") &&
    !["default", "dedicated", "host"].includes(input.InstanceTenancy)
  ) {
    throw new Error("Invalid value for InstanceTenancy, explain in more detail");
  }

  return input;
}
