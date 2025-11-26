import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { CustomDomain } from "../common/teams";

export interface CreateService {
  env: string,
  vpc: awsx.ec2.Vpc,
  cluster: awsx.ecs.Cluster, 
  repo: awsx.ecr.Repository, 
  dbUrl: pulumi.Output<string>,
  stacks: {
    networking: pulumi.StackReference,
    certificates: pulumi.StackReference,
    data: pulumi.StackReference,
  },
  CUSTOM_DOMAINS: CustomDomain[],
};
