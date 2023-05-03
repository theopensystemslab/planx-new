"use strict";

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const DB_ROOT_USERNAME = "dbuser";

const env = pulumi.getStack();
const networking = new pulumi.StackReference(`planx/networking/${env}`);

const db = new aws.rds.Instance("app", {
  engine: "postgres",
  // Available versions:
  // $ aws rds describe-db-engine-versions --default-only --engine postgres
  engineVersion: "12.11",
  // Available instance types: https://aws.amazon.com/rds/instance-types/
  instanceClass: env === "production" ? "db.t3.medium" : "db.t3.micro",
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
  backupRetentionPeriod: env === "production" ? 35 : 0,
  applyImmediately: true,
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
