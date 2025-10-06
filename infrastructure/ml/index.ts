import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

const config = new pulumi.Config();

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

const allowSSH = new aws.vpc.SecurityGroupIngressRule("ml-allow-ssh-in", {
    securityGroupId: mlSecurityGroup.id,
    cidrIpv4: "0.0.0.0/0", // allow SSH from anywhere
    fromPort: 22,
    toPort: 22,
    ipProtocol: "tcp",
});

const allowAllTrafficIpv4 = new aws.vpc.SecurityGroupEgressRule("ml-allow-ipv4-traffic-out", {
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

// create the g4dn EC2 instance for ML training and experiment workloads
const g4Instance = new aws.ec2.Instance("ml-training-instance-g4dn", {
  instanceType: aws.ec2.InstanceType.G4dn_XLarge,
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
    volumeSize: 128,
    deleteOnTermination: true,
    encrypted: true,
  },

  // script for basic setup/dependencies - runs only on first launch
  userData: fs.readFileSync(path.join(__dirname, "user_data.sh"), "utf8"),
});

// create a cost budget for ML resources (£200/month)
const mlBudget = new aws.budgets.Budget("ml-infra-budget-monthly", {
  name: "ml-infra-budget-monthly",
  budgetType: "COST",
  limitAmount: "250", // ~ £200
  limitUnit: "USD",
  timeUnit: "MONTHLY",
  timePeriodStart: "2025-10-01_00:00",
  
  // cost filters to track resources with project=ml tag (applied by default - see yaml config)
  costFilters: [{
    name: "TagKeyValue",
    values: ["user:project$ml"],
  }],
  
  // XXX: could add SNS/Lambda combo to stop/terminate instances when budget exceeded
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
export const g4InstanceId = g4Instance.id;
export const g4InstancePublicIp = g4Instance.publicIp;
export const g4InstancePublicDns = g4Instance.publicDns;
export const mlSecurityGroupId = mlSecurityGroup.id;
export const devopsKeyPairName = devopsKeyPair.keyName;
export const mlBudgetName = mlBudget.name;
export const sshCommand = pulumi.interpolate`ssh -i ~/.ssh/${devopsKeyPairName} ubuntu@${g4InstancePublicIp}`;
