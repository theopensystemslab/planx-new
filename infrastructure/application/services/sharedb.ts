import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { CreateService } from './../types';
import {
  setupDnsRecord,
  setupLoadBalancer,
  setupNotificationForDeploymentRollback,
} from "../utils";

export const createSharedbService = async ({
  env,
  vpcId,
  publicSubnetIds,
  cluster,
  repo,
  dbUrl,
  stacks: { certificates } = {},
}: CreateService): Promise<awsx.ecs.FargateService> => {
  if (!repo) {
    throw new Error("An ECR repo is required to setup ShareDB service");
  }
  if (!certificates) {
    throw new Error("The Pulumi certificates stack is required to setup ShareDB service");
  }
  const config = new pulumi.Config();
  const DOMAIN: string = await certificates.requireOutputValue("domain");

  const SHAREDB_PORT = 80;
  const {
    loadBalancer: sharedbLb,
    targetGroup: sharedbTargetGroup,
    serviceSecurityGroup: sharedbServiceSecurityGroup,
  } = await setupLoadBalancer({
    serviceName: "sharedb",
    containerPort: SHAREDB_PORT,
    vpcId,
    publicSubnetIds,
    domain: DOMAIN,
    healthCheck: {
      path: "/",
      matcher: "426", // "HTTP 426 Upgrade Required"
    },
    stickiness: {
      enabled: true,
      type: "lb_cookie", // default duration will be 1 day (86400s)
    },
  });

  const sharedbImage = new awsx.ecr.Image("sharedb-image", {
    repositoryUrl: repo.repository.repositoryUrl,
    context: "../../apps/sharedb.planx.uk",
  });
  const sharedbLogGroup = new aws.cloudwatch.LogGroup("sharedb", {
    name: "/ecs/sharedb",
    retentionInDays: 30,
  });
  const sharedbTask = new awsx.ecs.FargateTaskDefinition("sharedb", {
    logGroup: { existing: sharedbLogGroup },
    container: {
      name: "sharedb",
      image: sharedbImage.imageUri,
      essential: true,
      memory: 512 /*MB*/,
      portMappings: [{ targetGroup: sharedbTargetGroup }],
      environment: [
        { name: "PORT", value: String(SHAREDB_PORT) },
        { name: "API_URL_EXT", value: `https://api.${DOMAIN}` },
        { name: "PG_URL", value: dbUrl },
      ],
    },
  });

  const sharedbService = new awsx.ecs.FargateService("sharedb", {
    cluster: cluster.arn,
    taskDefinition: sharedbTask.taskDefinition.arn,
    loadBalancers: sharedbTask.loadBalancers,
    networkConfiguration: {
      subnets: publicSubnetIds,
      assignPublicIp: true,
      securityGroups: [sharedbServiceSecurityGroup.id],
    },
    desiredCount: 1,
    deploymentCircuitBreaker: {
      enable: true,
      rollback: true,
    },
  },
  {
    dependsOn: [sharedbLb],
  });

  setupNotificationForDeploymentRollback(env, "sharedb", cluster, sharedbService);
  setupDnsRecord("sharedb", DOMAIN, sharedbLb);
  return sharedbService;
}
