// Validates input for CreateVpcOptions
// Returns a validated and modified object to match https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/CreateVpcCommand/ 
export const validateVPCOptions = ({ ...input }) => {
    
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
      "Name"
    ];

    if (input === null) {
      input = {};
    }
    
    // list of inputs which don't match any known expected input, it is also case sensitive
    const unexpectedParams = Object.keys(input).filter((param) => !expectedParams.includes(param));
    
    if (unexpectedParams.length > 0) {
      throw new Error(`Unexpected parameter(s): ${unexpectedParams.join(", ")}`);
    }
  
    let validatedInput = validateVPCOptionTypes({...input});
    validatedInput = handleName({type: 'vpc', input: input});

    if (!validatedInput.hasOwnProperty("CidrBlock")) {
      validatedInput.CidrBlock = "10.0.1.0/24";
    }
  
    return validatedInput;
};

// Handle type restrictions for VPC options
const validateVPCOptionTypes = ({ ...input }) => {
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

// Handles conversion from name to TagsSpecifications for aws sdk api input
export const handleName = (
  {
    type, // type of resource, the same as for awsProvider *Resource methods
    input // inputed options inside our create* methods
  }) => {
  if (input.hasOwnProperty("Name")) {
    if (typeof input.Name === "string") {
      input.TagSpecifications = [{
        ResourceType: type,
        Tags: [{Key: "Name", Value: input.Name}],
      }];
      delete input.Name;
    } else {
      throw new Error("Name must be a string");
    }
  }
  return input;
}
