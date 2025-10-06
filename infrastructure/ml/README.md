 # Infra for ML

This Pulumi stack provisions AWS EC2 infrastructure for machine learning purposes - currently just training and experimentation.


## Resources

- **EC2 instance**: `g4dn.large` instance with GPU, running Ubuntu 24.04
- **Security Group**: SSH-only access (port 22)
- **Key pair**: For SSH authentication
- **Storage**: persistent EBS volume for data etc


## Deployment

```sh
# Deploy the ML infrastructure
pulumi up

# Get the instance details
pulumi stack output g4InstancePublicIp
pulumi stack output sshCommand
```


## Usage

### SSH in after initial provision

The following assumes you have access to the devops private key.

```sh
# Use the exported SSH command
$(pulumi stack output sshCommand)

# Or manually
ssh -i ~/.ssh/private_key ubuntu@$(pulumi stack output g4InstancePublicIp)
```

### Starting/stopping the instance

```sh
# Stop the instance (saves costs)
aws ec2 stop-instances --instance-ids $(pulumi stack output g4InstanceId)

# Start the instance again
aws ec2 start-instances --instance-ids $(pulumi stack output g4InstanceId)
```

Note that it takes a few minutes for an instance to fully stop, and you can't start it again until it's fully stopped. On start however, it spins up in a matter of seconds.

### Getting the new IP

After a restart, AWS assigns a new public IPv4 address (but the instance ID stays the same):

```sh
aws ec2 describe-instances --instance-ids $(pulumi stack output g4InstanceId) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

### Connecting to the instance

...


## Security considerations

- The security group allows SSH access from anywhere (0.0.0.0/0)
- Consider restricting SSH access to specific IP ranges for production use
- The instance has a public IP for easy access - consider using a bastion host for production


## Cost efficiency

- `g4dn.large` instances cost approximately $0.6/hour on-demand
- Always stop the instance when not in use to avoid charges
- Consider using spot instances for significant cost savings (requires work)
