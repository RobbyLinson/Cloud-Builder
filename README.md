# Cloud-Builder Code as Infrastructure Tool

Cloud-Builder is a command-line interface (CLI) tool designed to simplify the process of creating, running, and managing AWS resources using code. With an easy-to-use command set, users can quickly deploy infrastructure components on AWS.

## Features

- **Register/Login**: Secure user registration and login to manage AWS resources.
- **Greet**: Offers a personalized greeting to users.
- **Run**: Executes specified builder scripts to create or manage AWS resources.
- **Create**: Facilitates the creation of AWS resources such as VPCs, subnets, and instances.
- **Delete**: Allows for the deletion of specified AWS resources by name.
- **Update**: Updates the state file to reflect current AWS resource status accurately.

## Installation

To use Cloud-Builder, ensure Node.js is installed on your system. Follow these steps to install Cloud-Builder:

1. Clone this repository to your local machine.
2. Navigate to the cloned directory.
3. Run `npm install` to install the required dependencies.

## Configuration

Before using Cloud-Builder, configure your AWS credentials:

1. Use the Cloud-Builder CLI to choose a username by following the prompts to enter your details.
2. Upon successful login, you will be prompted to enter your AWS Access Key ID and Secret Access Key for AWS resource management.
3. The CLI will store your credentials securely for future sessions.

## Usage

### Changing User

```bash
clb user
```
Follow the prompts to change to a new user account.

### Greeting Command

```bash
clb greet <name>
```

Replace <name> with your name to receive a personalized greeting.

### Running a Builder Script

```bash
clb run <file name>
```

Specify the file name of the builder script you wish to execute.

### Creating AWS Resources

```bash
clb create <type> <name>
```

Replace <type> with the type of AWS resource you want to create (e.g., vpc, subnet) and <name> with a name for your resource.

### Deleting AWS Resources

```bash
clb delete <name>
```
Specify the name of the AWS resource you wish to delete.

### Updating State
```bash
clb update
```
Manually update the state file, reflecting the current status of AWS resources

### Logging
Operation logs are stored in the cli/logs directory for audit and troubleshooting purposes.

## Configuration

To use Cloud-Builder, you'll need to configure your AWS credentials. Follow these steps to set up:

1. Run the Cloud-Builder CLI and follow the prompts to enter your AWS Access Key ID and Secret Access Key.
2. The CLI will automatically create the necessary .aws directory and configuration files in your home directory.

## Contributing

This is an open source project, we welcome contributions to the Cloud-Builder project. Please feel free to submit issues or pull requests with improvements or new features.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

The GNU General Public License v3.0 (GPLv3) is a free, copyleft license for software and other kinds of works, offering the users the freedom to use, study, share (copy), and modify the software. Software that ensures that these rights are preserved, not just for the original authors, but for all subsequent users. For more information on GPLv3, please visit [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html).

