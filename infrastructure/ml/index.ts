"use strict"

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

const config = new pulumi.Config("ml");

// get the existing VPC from the networking stack
const env = pulumi.getStack();
const networking = new pulumi.StackReference(`planx/networking/${env}`);
const vpcId = networking.requireOutput("vpcId");
const publicSubnetIds = networking.requireOutput("publicSubnetIds");

// create security group for ML instances that allows SSH access only
const mlSecurityGroup = new aws.ec2.SecurityGroup("ml-ssh-sg", {
  description: "Security group for ML EC2 instances - SSH access only",
  vpcId: vpcId,
});

new aws.vpc.SecurityGroupIngressRule("ml-allow-ssh-in", {
    securityGroupId: mlSecurityGroup.id,
    cidrIpv4: "0.0.0.0/0", // allow SSH from anywhere
    fromPort: 22,
    toPort: 22,
    ipProtocol: "tcp",
});

new aws.vpc.SecurityGroupEgressRule("ml-allow-ipv4-traffic-out", {
    securityGroupId: mlSecurityGroup.id,
    cidrIpv4: "0.0.0.0/0",
    ipProtocol: "-1",
});

// load existing public key into the instance so we can SSH in
const publicKey = config.require("ssh-devops-public-key");
const devopsKeyPair = new aws.ec2.KeyPair("ssh-devops-key-pair", {
    keyName: "ssh-devops-key-pair",
    publicKey: publicKey,
})

// see https://docs.aws.amazon.com/dlami/latest/devguide/appendix-ami-release-notes.html
const amazonLinuxAmi = aws.ec2.getAmi({
  mostRecent: true,
  owners: ["amazon"],
  filters: [
    {
      name: "name",
      values: ["Deep Learning Base OSS Nvidia Driver GPU AMI (Ubuntu 24.04)*"],
    },
    {
      name: "state",
      values: ["available"],
    },
  ],
});

const getInstanceType = (): pulumi.Output<string> => {
  const trainingInstanceType = config.require("training-instance-type");
  const validInstanceTypes = Object.values(aws.ec2.InstanceType);
  
  // apply a transformation to the config value to check if it's a valid instance type
  return pulumi.output(trainingInstanceType).apply(instanceType => {
    if (validInstanceTypes.includes(instanceType as aws.ec2.InstanceType)) {
      return instanceType;
    }
    throw new Error(`Invalid instance type: ${instanceType}. Must be one of: ${validInstanceTypes.join(', ')}`);
  });
}

// create the EC2 instance for ML training and experiment workloads
const trainingInstance = new aws.ec2.Instance("ml-training-instance", {
  // see https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/#instancetype
  instanceType: getInstanceType(),
  ami: amazonLinuxAmi.then(ami => ami.id),
  keyName: devopsKeyPair.keyName,
  
  // use first public subnet in vpc (you can make this configurable)
  subnetId: publicSubnetIds.apply(subnets => subnets[0]),
  vpcSecurityGroupIds: [mlSecurityGroup.id],
  
  // assign a public IP for SSH access
  associatePublicIpAddress: true,
  
  // don't terminate on shutdown
  instanceInitiatedShutdownBehavior: "stop",
  
  // persistent EBS volume configuration for ML workloads (survives instance stop/starts)
  rootBlockDevice: {
    volumeType: "gp3",
    volumeSize: 256,
    deleteOnTermination: true,
    encrypted: true,
  },

  // script for basic setup/dependencies - runs only on first launch
  userData: fs.readFileSync(path.join(__dirname, "user_data.sh"), "utf8"),
});

// create a persistent IP for easy connection across sessions
const trainingInstanceEip = new aws.ec2.Eip("ml-training-instance-eip", {
  domain: "vpc",
  instance: trainingInstance.id,
});

// create a cost budget for ML resources (£200/month)
const mlBudget = new aws.budgets.Budget("ml-infra-budget-monthly", {
  name: "ml-infra-budget-monthly",
  budgetType: "COST",
  limitAmount: "250", // ~ £200
  limitUnit: "USD",
  timeUnit: "MONTHLY",
  timePeriodStart: "2025-10-01_00:00",
  
  // cost filters to track resources with project=ml tag (applied by default via yaml config)
  costFilters: [{
    name: "TagKeyValue",
    values: ["project$ml"],
  }],
  
  // XXX: could add SNS/Lambda combo to stop instances when budget exceeded
  notifications: [
    {
      comparisonOperator: "GREATER_THAN",
      threshold: 80, // alert at 80% of budget
      thresholdType: "PERCENTAGE", 
      notificationType: "ACTUAL",
      subscriberEmailAddresses: [
        "devops@opensystemslab.io",
      ],
    },
    {
      comparisonOperator: "GREATER_THAN",
      threshold: 100, // alert again when budget is exceeded
      thresholdType: "PERCENTAGE",
      notificationType: "ACTUAL",
      subscriberEmailAddresses: [
        "devops@opensystemslab.io", 
      ],
    },
  ],
});

// export important values
export const devopsKeyPairName = devopsKeyPair.keyName;
export const mlSecurityGroupId = mlSecurityGroup.id;
export const mlBudgetName = mlBudget.name;
export const trainingInstanceId = trainingInstance.id;
export const trainingInstancePublicDns = trainingInstance.publicDns;
export const trainingInstancePublicIp = trainingInstanceEip.publicIp;
export const sshCommand = pulumi.interpolate`ssh -i ~/.ssh/ssh_devops_private_key ubuntu@${trainingInstancePublicIp}`;
