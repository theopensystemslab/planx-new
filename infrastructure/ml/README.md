 # Infra for ML

This Pulumi stack provisions AWS EC2 infrastructure for machine learning purposes - currently just training and experimentation.

## Resources

- **EC2 Instance**: `g4dn.large` instance with GPU
- **Security Group**: SSH-only access (port 22)
- **Key Pair**: For SSH authentication (optional, can use existing)
- **Storage**: persistent EBS volume for data etc.

## Deployment

```bash
# Deploy the ML infrastructure
pulumi up

# Get the instance details
pulumi stack output g4InstancePublicIp
pulumi stack output sshCommand
```

## Usage

### SSH in (assumes you have devops key)

```bash
# Use the exported SSH command
$(pulumi stack output sshCommand)

# Or manually
ssh -i ~/.ssh/your-keypair ec2-user@$(pulumi stack output g4InstancePublicIp)
```

### Starting/Stopping the Instance

```bash
# Stop the instance (saves costs)
aws ec2 stop-instances --instance-ids $(pulumi stack output g4InstanceId)

# Start the instance
aws ec2 start-instances --instance-ids $(pulumi stack output g4InstanceId)

# Get new public IP after restart
aws ec2 describe-instances --instance-ids $(pulumi stack output g4InstanceId) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

## Security Considerations

- The security group allows SSH access from anywhere (0.0.0.0/0)
- Consider restricting SSH access to specific IP ranges for production use
- The instance has a public IP for easy access - consider using a bastion host for production

## Cost Optimization

- `g4dn.large` instances cost approximately $0.526/hour on-demand
- Always stop the instance when not in use to avoid charges
- Consider using spot instances for significant cost savings (requires work)
