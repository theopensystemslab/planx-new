import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

export interface CreateService {
  vpc: awsx.ec2.Vpc,
  cluster: awsx.ecs.Cluster, 
  repo: awsx.ecr.Repository, 
  dbUrl: pulumi.Output<string>,
  stacks: {
    networking: pulumi.StackReference,
    certificates: pulumi.StackReference,
    data: pulumi.StackReference,
  },
  CUSTOM_DOMAINS: Record<string, string>[],
};
