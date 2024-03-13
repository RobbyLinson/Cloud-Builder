# Cloud-Builder Code as Infrastructure Tool

Cloud-Builder uses a command-line interface (CLI) tool designed to simplify the process of creating, running, and managing AWS resources using code instead of documentation. With an easy-to-use command set, users can quickly deploy infrastructure components on AWS.

## Features

- **Greet**: Offers a personalized greeting to users.
- **Run**: Executes a specified builder script.
- **Create**: Facilitates the creation of AWS resources such as VPCs, subnets, and instances.
- **Delete**: Allows for the deletion of specified AWS resources by name.

## Installation

Before you can use Cloud-Builder, you need to have Node.js installed on your system. Once Node.js is installed, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the cloned directory and run `npm install` to install the required dependencies.

## Usage

Here's how to use the Cloud-Builder CLI:

### Greeting Command

```bash
cloud-builder greet <name>
```

Replace <name> with your name to receive a personalized greeting.

### Running a Builder Script

```bash
cloud-builder run <file name>
```

Specify the file name of the builder script you wish to execute.

### Creating AWS Resources

```bash
cloud-builder create <type> <name>
```

Replace <type> with the type of AWS resource you want to create (e.g., vpc, subnet) and <name> with a name for your resource.

### Deleting AWS Resources

```bash
cloud-builder delete <name>
```

Specify the name of the AWS resource you wish to delete.

## Configuration

To use Cloud-Builder, you'll need to configure your AWS credentials. Follow these steps to set up:

1. Run the Cloud-Builder CLI and follow the prompts to enter your AWS Access Key ID and Secret Access Key.
2. The CLI will automatically create the necessary .aws directory and configuration files in your home directory.

## Contributing

This is an open source project, we welcome contributions to the Cloud-Builder project. Please feel free to submit issues or pull requests with improvements or new features.
