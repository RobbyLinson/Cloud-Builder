import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/documentation.css'; // Make sure this path is correct
import MethodCard from './MethodCard'; // Adjust the path as needed
import logo from '../../images/Cloud-Builder-Logo.png'


const methods = [
    {name: "greet",location: "CLI",functionality: "Greets a user by name",parameters: ["name: Name of the user to greet"]},
    {name: "run",functionality: "Executes a JavaScript file with options for state comparison and file preview.",location: "CLI",parameters: ["file: Path to the JavaScript file to execute", "-u: Use compare and update state feature (optional)", "-p: Enable file preview (optional)"]},
    { name: "create",functionality: "Creates a new resource of a specified type and name, with additional configurable options.",location: "CLI",parameters: ["type: Type of the resource", "name: Name for the new resource", "options: Additional key=value pairs (optional)"]},
    {name: "delete",functionality: "Deletes a resource by its name, such as a mainVpc, mainSubnet, or a linuxInstance.",location: "CLI",parameters: ["resource_name: Name of the resource to delete"]},
    { name: "update",functionality: "Updates the state file to reflect the current state of resources.",location: "CLI",parameters: []},    
    { name: "loadProviderConfig", location: "Provider", functionality: "Reads data from providers.json and runs the loadProvider function.", parameters: ["URL path for providers.json"] },
    { name: "loadProvider", location: "Provider", functionality: "Launches the file providerAws.js.", parameters: ["config (JSON file)", "provider (index from which the file is being read)"] },
    { name: "providerAws", location: "Provider", functionality: "Executes functions to manage AWS resources, such as describing, terminating, creating, or updating resources.", parameters: ["region", "accessKeyId", "secretAccessKey", "statefile"] },
    { name: "describeResources", location: "Provider", functionality: "Describes AWS resources such as VPC, subnet, instance, or NAT gateway based on the input type.", parameters: ["type", "resourceIds"] },
    { name: "terminateResource", location: "Provider", functionality: "Terminates AWS resources like VPC, subnet, instance, or NAT gateway.", parameters: ["type", "resourceIds"] },
    { name: "createResource", location: "Provider", functionality: "Creates AWS resources such as VPC, subnet, instance, or NAT gateway.", parameters: ["type", "Name", "...options"] },
    { name: "updateResource", location: "Provider", functionality: "Updates a VPC name.", parameters: ["type", "id", "name"] },
    { name: "createInstance", location: "Instance", functionality: "Creates an instance through the AWS API with dynamic error handling.", parameters: ["ec2Client", "...options"] },
    { name: "describeInstance", location: "Instance", functionality: "Retrieves information about a specific instance via the AWS API.", parameters: ["ec2Client", "instanceIds"] },
    { name: "getInstance", location: "Instance", functionality: "Retrieves the current state of a specified instance.", parameters: ["ec2Client", "instanceIds"] },
    { name: "deleteInstance", location: "Instance", functionality: "Deletes a specific instance via the AWS API.", parameters: ["ec2Client", "instanceIds"] },
    { name: "createNatGateway", location: "NatGateway", functionality: "Creates a NatGateway through the AWS API with dynamic error handling.", parameters: ["ec2Client", "...options"] },
    { name: "describeNatGateway", location: "NatGateway", functionality: "Retrieves information about a specific NatGateway via the AWS API.", parameters: ["ec2Client", "NatGatewayIds"] },
    { name: "deleteNatGateway", location: "NatGateway", functionality: "Deletes a specific NatGateway via the AWS API.", parameters: ["ec2Client", "NatGatewayIds"] },
    { name: "createSubnet", location: "Subnet", functionality: "Creates a subnet through the AWS API with dynamic error handling.", parameters: ["ec2Client", "...options"] },
    { name: "describeSubnet", location: "Subnet", functionality: "Retrieves information about a specific subnet via the AWS API.", parameters: ["ec2Client", "subnetIds"] },
    { name: "deleteSubnet", location: "Subnet", functionality: "Deletes a specific subnet via the AWS API.", parameters: ["ec2Client", "subnetIds"] },
    { name: "createVpc", location: "VPC", functionality: "Creates a VPC through the AWS API with dynamic error handling.", parameters: ["ec2Client", "...options"] },
    { name: "describeVpc", location: "VPC", functionality: "Retrieves information about a specific VPC via the AWS API.", parameters: ["ec2Client", "vpcIds"] },
    { name: "getVpc", location: "VPC", functionality: "Retrieves the current state of a specified VPC.", parameters: ["ec2Client", "vpcIds"] },
    { name: "deleteVpc", location: "VPC", functionality: "Deletes a specific VPC via the AWS API.", parameters: ["ec2Client", "vpcIds"] },
    { name: "validateVPCOptions", location: "Validation", functionality: "Validates the input for VPC options and throws an error if input is not proper.", parameters: ["Array of VPC options"] },
    { name: "validateVPCOptionTypes", location: "Validation", functionality: "Tests if the input is a valid VPC option and matches the type's requirements.", parameters: ["Array of VPC options"] },
    { name: "handleName", location: "Validation", functionality: "Converts tag specifications for AWS API input.", parameters: ["Resource type", "inputs"] }

  // Add more methods as needed
];

const Documentation = () => {
    return (
      // Using a React Fragment to avoid adding extra nodes to the DOM
      <>
        <Link to="/" className="home-button">Home</Link>
        <div className="documentation-page">
        <img src={logo} alt="Cloud Builder" className="logo" />
          <h2>Documentation</h2>
          <div className="methods-container">
            {methods.map((method, index) => (
              <MethodCard key={index} name={method.name} location={method.location} functionality={method.functionality} parameters={method.parameters} />
            ))}
          </div>
        </div>
      </>
    );
  };
  
  export default Documentation;
  

