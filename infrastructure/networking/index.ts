"use strict";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const vpc = new awsx.ec2.Vpc("vpc", {
  natGateways: {
    strategy: awsx.ec2.NatGatewayStrategy.None,
  }
});

const cluster = new aws.ecs.Cluster("cluster", {
  settings: [
    {
      name: "containerInsights",
      value: "enabled",
    },
  ],
});

const dbSubnetGroup = new aws.rds.SubnetGroup("db-subnet-group", {
  subnetIds: vpc.publicSubnetIds,
});

export const dbSubnetGroupId = dbSubnetGroup.id;
export const vpcId = vpc.vpcId;
export const clusterName = cluster.name;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;
