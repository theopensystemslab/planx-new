"use strict";

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const DB_ROOT_USERNAME = "dbuser";

const env = pulumi.getStack();
const networking = new pulumi.StackReference(`planx/networking/${env}`);

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
  dbSubnetGroupName: networking.requireOutput("subnetId"),
  vpcSecurityGroupIds: networking.requireOutput("vpcSecurityGroupIds"),
  name: "app",
  username: DB_ROOT_USERNAME,
  password: config.require("db-password"),
  skipFinalSnapshot: true,
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
