 # Infra for ML

This Pulumi stack provisions AWS EC2 infrastructure for machine learning purposes - currently just training and experimentation.


## Resources

- **EC2 instance**: `g6.xlarge` instance with Nvidia L4 GPU, running Ubuntu 24.04 Deep Learning AMI
- **Security Group**: SSH-only access (port 22)
- **Key pair**: For SSH authentication
- **Storage**: 
  - **Persistent EBS**: 128GB persistent EBS volume as root (survives stop/start)
  - **Ephemeral NVMe**: ~209GB high-speed instance store at `/opt/dlami/nvme` (lost on stop)


## Deployment

```sh
# Deploy the ML infrastructure
pulumi up

# Get the instance details
pulumi stack output g4InstancePublicIp
pulumi stack output sshCommand
```


## Storage

The g6 instance, as configured, provides two types of storage:

### Persistent storage (EBS)

- **Location**: `/` (root filesystem) 
- **Size**: 256GB
- **Type**: gp3 encrypted EBS volume
- **Persistence**: Survives instance stop/start/reboot
- **Use for**: Code, final models, config, Python env

### Ephemeral storage (instance store)

- **Location**: `/opt/dlami/nvme` (auto-mounted by the DLAMI)
- **Convenience symlink**: `/home/ubuntu/nvme` 
- **Size**: ~230GB
- **Type**: High-speed NVMe SSD
- **Persistence**: **Lost when instance stops** i.e. data is temporary
- **Use for**: Training datasets, model checkpoints during training, Docker images, temporary files

⚠️ The instance store (`/opt/dlami/nvme`) is ephemeral - all data is lost when the instance stops. Always backup important data to the persistent EBS volume or S3.


## Usage

### SSH in after provision

The following assumes you have access to the devops private key.

```sh
# Use the exported SSH command
$(pulumi stack output sshCommand)

# Or manually
ssh -i ~/.ssh/private_key ubuntu@$(pulumi stack output g6InstancePublicIp)
```

### Starting/stopping the instance

```sh
# Stop the instance (saves costs)
aws ec2 stop-instances --instance-ids $(pulumi stack output g6InstanceId)

# Start the instance again
aws ec2 start-instances --instance-ids $(pulumi stack output g6InstanceId)
```

Note that it takes a few minutes for an instance to fully stop, and you can't start it again until it's fully stopped. On start however, it spins up in a matter of seconds.

### Getting the new IP

After a restart, AWS assigns a new public IPv4 address (but the instance ID stays the same):

```sh
aws ec2 describe-instances --instance-ids $(pulumi stack output g6InstanceId) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```


## Security considerations

- The security group allows SSH access from anywhere (0.0.0.0/0)
- Consider restricting SSH access to specific IP ranges for production use
- The instance has a public IP for easy access - consider using a bastion host for production


## Cost efficiency

- `g6.xlarge` instance costs approximately $1/hour on-demand
- Always stop the instance when not in use to avoid charges
- Consider using spot instances for significant cost savings (requires work)
