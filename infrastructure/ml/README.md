 # ML Infrastructure

This Pulumi stack provisions AWS EC2 infrastructure for machine learning training workloads.

## Resources Provisioned

- **EC2 Instance**: `g4dn.large` instance with GPU support for ML training
- **Security Group**: SSH-only access (port 22)
- **Key Pair**: For SSH authentication (optional, can use existing)
- **Storage**: 100GB root volume + 500GB additional volume for datasets

## Configuration

### Option 1: Use Existing Key Pair (Recommended)

Set the existing key pair name in your Pulumi configuration:

```bash
pulumi config set existing-keypair-name your-existing-keypair-name
```

### Option 2: Create New Key Pair

Provide your public key to create a new key pair:

```bash
pulumi config set ml-public-key "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB... your-public-key"
```

## Deployment

```bash
# Deploy the ML infrastructure
pulumi up

# Get the instance details
pulumi stack output mlInstancePublicIp
pulumi stack output sshCommand
```

## Usage

### SSH into the Instance

```bash
# Use the exported SSH command
$(pulumi stack output sshCommand)

# Or manually
ssh -i ~/.ssh/your-keypair.pem ec2-user@$(pulumi stack output mlInstancePublicIp)
```

### Storage

- Root volume: `/` (100GB) - for system and ML libraries
- Data volume: `/mnt/ml-data` (500GB) - for datasets and models

### Pre-installed Software

The instance comes with:
- Python 3 and pip
- Common ML libraries: numpy, pandas, matplotlib, seaborn, scikit-learn, jupyter
- Development tools: git, htop, tmux

### Starting/Stopping the Instance

```bash
# Stop the instance (saves costs)
aws ec2 stop-instances --instance-ids $(pulumi stack output mlInstanceId)

# Start the instance
aws ec2 start-instances --instance-ids $(pulumi stack output mlInstanceId)

# Get new public IP after restart
aws ec2 describe-instances --instance-ids $(pulumi stack output mlInstanceId) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

## Security Considerations

- The security group allows SSH access from anywhere (0.0.0.0/0)
- Consider restricting SSH access to specific IP ranges for production use
- The instance has a public IP for easy access - consider using a bastion host for production

## Cost Optimization

- `g4dn.large` instances cost approximately $0.526/hour on-demand
- Always stop the instance when not in use to avoid charges
- Consider using Spot instances for significant cost savings (requires code changes)

 
 # AWS TypeScript Pulumi Template

 A minimal Pulumi template for provisioning AWS infrastructure using TypeScript. This template creates an Amazon S3 bucket and exports its name.

 ## Prerequisites

 - Pulumi CLI (>= v3): https://www.pulumi.com/docs/get-started/install/
 - Node.js (>= 14): https://nodejs.org/
 - AWS credentials configured (e.g., via `aws configure` or environment variables)

 ## Getting Started

 1. Initialize a new Pulumi project:

    ```bash
    pulumi new aws-typescript
    ```

    Follow the prompts to set your:
    - Project name
    - Project description
    - AWS region (defaults to `us-east-1`)

 2. Preview and deploy your infrastructure:

    ```bash
    pulumi preview
    pulumi up
    ```

 3. When you're finished, tear down your stack:

    ```bash
    pulumi destroy
    pulumi stack rm
    ```

 ## Project Layout

 - `Pulumi.yaml` — Pulumi project and template metadata
 - `index.ts` — Main Pulumi program (creates an S3 bucket)
 - `package.json` — Node.js dependencies
 - `tsconfig.json` — TypeScript compiler options

 ## Configuration

 | Key           | Description                             | Default     |
 | ------------- | --------------------------------------- | ----------- |
 | `aws:region`  | The AWS region to deploy resources into | `us-east-1` |

 Use `pulumi config set <key> <value>` to customize configuration.

 ## Next Steps

 - Extend `index.ts` to provision additional resources (e.g., VPCs, Lambda functions, DynamoDB tables).
 - Explore [Pulumi AWSX](https://www.pulumi.com/docs/reference/pkg/awsx/) for higher-level AWS components.
 - Consult the [Pulumi documentation](https://www.pulumi.com/docs/) for more examples and best practices.

 ## Getting Help

 If you encounter any issues or have suggestions, please open an issue in this repository.
