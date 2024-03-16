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
      "Name",
    ];
    
    // list of inputs which don't match any known expected input, it is also case sensitive
    const unexpectedParams = Object.keys(input).filter((param) => !expectedParams.includes(param));
    
    if (unexpectedParams.length > 0) {
      throw new Error(`Unexpected parameter(s): ${unexpectedParams.join(", ")}`);
    }
  
    let validatedInput = validateVPCtypes({...input});
  
    return validatedInput;
};

// Handle type restrictions for VPC options
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

  // Name converts to proper structure according to expected input for CreateVPC
  if (input.hasOwnProperty("Name") && typeof input.Name === "string") {
    
    // Automatically create TagSpecifications
    input.TagSpecifications = [
    ({
      ResourceType: "vpc",
      Tags: [{Key: "Name", Value: input.Name}],
    })];

    // Remove the individual Name property as it's no longer needed
    delete input.Name;
  } else {
    throw new Error("Name must be a string");
  }

  return input;
}


