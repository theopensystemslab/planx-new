 # Infra for ML

This Pulumi stack provisions AWS EC2 infrastructure for machine learning purposes - currently just training and experimentation.


## Resources

- **EC2 instance**: GPU accelerated instance running Ubuntu 24.04 Deep Learning AMI
- **Security Group**: SSH-only access (port 22)
- **Key pair**: For SSH authentication
- **Storage**: 
  - **Persistent EBS**: 256GB persistent EBS volume as root (survives stop/start)
  - **Ephemeral NVMe**: > 200GB high-speed instance store at `/opt/dlami/nvme` (lost on stop)

The instance type can be varied by adjusting the `training-instance-type` variable in the `Pulumi.staging.config.yaml` config. It should be specified by the AWS-native string, rather than the Pulumi `InstanceType` key. Consult the AWS spec [here](https://docs.aws.amazon.com/ec2/latest/instancetypes/ac.html#ac_hardware), and compare pricing [here](https://aws.amazon.com/ec2/pricing/on-demand/). For example, you could run the following:

```
pulumi config set training-instance-type g6.xlarge
```


## Deployment

```sh
# Deploy the ML infrastructure
pulumi up

# Get the instance details
pulumi stack output trainingInstancePublicIp
pulumi stack output sshCommand
```

Some of the resources provisioned here are persistent, even when the instance (by far the most expensive aspect) in spun down - for example, the EBS storage. If we aren't engaged in an ML training project over a sustained period, these resources can be deleted entirely to save cost. Just make sure to retrieve anything crucial (e.g. model weights) from the persistent store before doing so.

```
# Remove all ML infra
pulumi down
```


## Storage

The training instance provides two types of storage:

### Persistent storage (EBS)

- **Location**: `/` (root filesystem) 
- **Size**: 256GB
- **Type**: gp3 encrypted EBS volume
- **Persistence**: Survives instance stop/start/reboot, and reassignment to different instance type
- **Use for**: Code, final models, config, Python env

### Ephemeral storage (instance store)

- **Location**: `/opt/dlami/nvme` (auto-mounted by the DLAMI)
- **Convenience symlink**: `/home/ubuntu/nvme` 
- **Size**: ~230GB (for `g6.xlarge`, as an example)
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
ssh -i ~/.ssh/private_key ubuntu@$(pulumi stack output trainingInstancePublicIp)
```

### Starting/stopping the instance

```sh
# Stop the instance (saves costs)
aws ec2 stop-instances --instance-ids $(pulumi stack output trainingInstanceId)

# Start the instance again
aws ec2 start-instances --instance-ids $(pulumi stack output trainingInstanceId)
```

Note that it takes a few minutes for an instance to fully stop, and you can't start it again until it's fully stopped. On start however, it spins up in a matter of seconds.

### Getting the IP

The instance has an Elastic IP attached, which should not change, but if for some reason AWS should assign a new public IPv4 address, use the following command to check it:

```sh
aws ec2 describe-instances --instance-ids $(pulumi stack output trainingInstanceId) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```


## Security considerations

- The security group allows SSH access from anywhere (0.0.0.0/0)
- Consider restricting SSH access to specific IP ranges for production use
- The instance has a public IP for easy access - consider using a bastion host for production


## Cost efficiency

- Exemplar `g6.xlarge` instance (w/ L4 GPU) costs approximately $1/hour on-demand
- Always stop the instance when not in use to avoid charges (see above commands)
- Consider using spot instances for significant cost savings (requires work)
