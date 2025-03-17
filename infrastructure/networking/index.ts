"use strict";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const vpc = new awsx.ec2.Vpc("vpc", {
  numberOfNatGateways: 0,
});
const cluster = new awsx.ecs.Cluster("cluster", {
  vpc,
  settings: [
    {
      name: "containerInsights",
      value: "enabled",
    },
  ],
});
const subnet = new aws.rds.SubnetGroup("subnet-group", {
  subnetIds: vpc.publicSubnetIds,
});

// Create a private DNS namespace so that Fargate services can communicate with each other within the VPC
const privateDnsNamespace = new aws.servicediscovery.PrivateDnsNamespace("private-dns-namespace", {
  name: "internal",
  vpc: vpc.id,
});

export const subnetId = subnet.id;
export const vpcSecurityGroupIds = cluster.securityGroups.map((g) => g.id);
export const vpcId = vpc.id;
export const clusterName = cluster.cluster.name;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateDnsNamespaceId = privateDnsNamespace.id