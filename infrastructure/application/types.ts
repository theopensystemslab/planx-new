import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { CustomDomain } from "../common/teams";

export interface CreateService {
  env: string,
  vpcId: pulumi.Output<string>,
  publicSubnetIds: pulumi.Output<string[]>,
  cluster: aws.ecs.Cluster,
  repo: awsx.ecr.Repository, 
  dbUrl: pulumi.Output<string>,
  stacks: {
    networking: pulumi.StackReference,
    certificates: pulumi.StackReference,
    data: pulumi.StackReference,
  },
  CUSTOM_DOMAINS: CustomDomain[],
};

export type KeyValuePair = {
  name: string;
  value: string | pulumi.Output<string>;
};
