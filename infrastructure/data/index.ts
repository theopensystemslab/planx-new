"use strict";

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const DB_ROOT_USERNAME = "dbuser";

const env = pulumi.getStack();
const networking = new pulumi.StackReference(`planx/networking/${env}`);

const vpcId = networking.requireOutput("vpcId") as pulumi.Output<string>;

// create dedicated security group and ingress/egress rules for the RDS instance
const dbSecurityGroup = new aws.ec2.SecurityGroup("db-sg", {
  description: "Security group for RDS instance",
  vpcId: vpcId,
});

new aws.vpc.SecurityGroupIngressRule("db-allow-ssh-in", {
    securityGroupId: dbSecurityGroup.id,
    cidrIpv4: "0.0.0.0/0", // allow SSH from anywhere
    fromPort: 22,
    toPort: 22,
    ipProtocol: "tcp",
});

new aws.vpc.SecurityGroupIngressRule("db-allow-tcp-in", {
    securityGroupId: dbSecurityGroup.id,
    cidrIpv4: "0.0.0.0/0", // allow TCP from anywhere
    fromPort: 5432,
    toPort: 5432,
    ipProtocol: "tcp",
});

new aws.vpc.SecurityGroupEgressRule("db-allow-ipv4-traffic-out", {
    securityGroupId: dbSecurityGroup.id,
    cidrIpv4: "0.0.0.0/0",
    ipProtocol: "-1",
});

// ShareDB does not use SSL - from Postgres 16 onwards this is forced on my default
// Create a parameter group which turns this setting off
const parameterGroup = new aws.rds.ParameterGroup("parameterGroup", {
  name: "postgres16-force-ssl-off",
  family: "postgres16",
  parameters: [
    {
      applyMethod: "immediate",
      name: "rds.force_ssl",
      value: "0",
    },
  ],
});

const db = new aws.rds.Instance("app", {
  engine: "postgres",
  // AWS restricts the maximum upgrade leap, see available versions:
  // $ aws rds describe-db-engine-versions --engine postgres  --engine-version your-version --query "DBEngineVersions[*].ValidUpgradeTarget[*].{EngineVersion:EngineVersion}" --output text
  engineVersion: "16.7",
  // Available instance types: https://aws.amazon.com/rds/instance-types/
  instanceClass: env === "production" ? "db.t3.medium" : "db.t3.small",
  allocatedStorage: env === "production" ? 100 : 20,
  allowMajorVersionUpgrade: true,
  dbSubnetGroupName: networking.requireOutput("dbSubnetGroupId"),
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  username: DB_ROOT_USERNAME,
  password: config.require("db-password"),
  // we should keep a snapshot in case of (potentially mistaken) deletion
  skipFinalSnapshot: false,
  finalSnapshotIdentifier: "final-before-deletion",
  publiclyAccessible: true,
  storageEncrypted: true,
  backupRetentionPeriod: env === "production" ? 35 : 1,
  applyImmediately: true,
  parameterGroupName: parameterGroup.name,
  maintenanceWindow: "Mon:00:00-Mon:03:00",
});
export const dbRootUrl = pulumi.interpolate`postgres://${DB_ROOT_USERNAME}:${config.require(
  "db-password"
)}@${db.endpoint}/postgres`;

const apiBucket = new aws.s3.Bucket("user-data", {
  corsRules: [
    {
      allowedHeaders: ["*"],
      allowedMethods: ["PUT", "POST", "GET", "HEAD"],
      // TODO: Narrow down allowed origin to the domain we're using
      allowedOrigins: ["*"],
      exposeHeaders: ["ETag"],
      maxAgeSeconds: 3000,
    },
  ],
  // Encrypt objects at rest using SSE-S3 encryption
  serverSideEncryptionConfiguration: {
    rule: {
      applyServerSideEncryptionByDefault: {
          sseAlgorithm: "AES256",
        },
      },
    },
});

export const apiBucketId = apiBucket.id;
