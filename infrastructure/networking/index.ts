"use strict";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// NB. the CIDR block for the awsx-provisioned VPC defaults to 10.0.0.0/16 (no ipv6 by default)
const vpc = new awsx.ec2.Vpc("vpc", {
  enableDnsHostnames: true,
  enableDnsSupport: true,
  natGateways: {
    strategy: awsx.ec2.NatGatewayStrategy.None,
  },
  // for subnets, "Legacy" strategy is default, but will be "Auto" in next major version, so we configure explicitly
  subnetStrategy: awsx.ec2.SubnetAllocationStrategy.Legacy
});

// we allocate the RDS instance to the 2 public subnets so it can be hit from the internet
const dbSubnetGroup = new aws.rds.SubnetGroup("db-subnet-group", {
  subnetIds: vpc.publicSubnetIds,
});

export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;
export const dbSubnetGroupId = dbSubnetGroup.id;
