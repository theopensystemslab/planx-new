"use strict";

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();

const DB_ROOT_USERNAME = "dbuser";

const env = pulumi.getStack();
const networking = new pulumi.StackReference(`planx/networking/${env}`);
const certificates = new pulumi.StackReference(`planx/certificates/${env}`);

const db = new aws.rds.Instance("app", {
  engine: "postgres",
  // Available versions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html#PostgreSQL.Concepts.General.version12
  engineVersion: "12.3",
  // Available instance types: https://aws.amazon.com/rds/instance-types/
  instanceClass: "db.t2.micro",
  allocatedStorage: 20,
  allowMajorVersionUpgrade: true,
  dbSubnetGroupName: networking.requireOutput("subnetId"),
  vpcSecurityGroupIds: networking.requireOutput("vpcSecurityGroupIds"),
  name: "app",
  username: DB_ROOT_USERNAME,
  password: config.require("db-password"),
  skipFinalSnapshot: true,
  publiclyAccessible: true,
  backupRetentionPeriod: 35, // days (0-35)
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
});
export const apiBucketId = apiBucket.id;
