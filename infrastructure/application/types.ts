import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { CustomDomain } from "../common/teams";

export interface SetupLoadBalancer {
  serviceName: string,
  containerPort: number,
  vpcId: pulumi.Output<string>,
  publicSubnetIds: pulumi.Output<string[]>,
  domain: string,
  idleTimeout?: number,
  healthCheck?: aws.types.input.lb.TargetGroupHealthCheck,
  stickiness?: aws.types.input.lb.TargetGroupStickiness,
}

export interface CreateService {
  env: string,
  vpcId: pulumi.Output<string>,
  publicSubnetIds: pulumi.Output<string[]>,
  cluster: aws.ecs.Cluster,
  repo?: awsx.ecr.Repository, 
  dbUrl?: pulumi.Output<string>,
  customDomains?: CustomDomain[],
  stacks?: {
    certificates?: pulumi.StackReference,
    data?: pulumi.StackReference,
    networking?: pulumi.StackReference,
  },
};

export type KeyValuePair = {
  name: string;
  value: string | pulumi.Output<string>;
};
