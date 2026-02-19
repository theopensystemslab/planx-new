import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { CreateService } from './../types';
import {
  getJavaOpts,
  setupDnsRecord,
  setupLoadBalancer,
  setupNotificationForDeploymentRollback,
} from "../utils";

export const createMetabaseService = async ({
  env,
  vpcId,
  publicSubnetIds,
  cluster,
  dbUrl,
  stacks: { certificates } = {},
}: CreateService): Promise<awsx.ecs.FargateService> => {
  if (!certificates) {
    throw new Error("The Pulumi certificates stack is required to setup Metabase service");
  }
  const config = new pulumi.Config();
  const DOMAIN: string = await certificates.requireOutputValue("domain");

  const METABASE_PORT = 3000;
  const {
    loadBalancer: metabaseLb,
    targetGroup: metabaseTargetGroup,
    serviceSecurityGroup: metabaseServiceSecurityGroup,
  } = await setupLoadBalancer({
    serviceName: "metabase",
    containerPort: METABASE_PORT,
    vpcId,
    publicSubnetIds,
    domain: DOMAIN,
    healthCheck: {
      path: "/api/health",
      // XXX: Attempt to fix "504 Gateway Time-out"
      healthyThreshold: 2,
      interval: 300,
      timeout: 120,
      unhealthyThreshold: 10,
    }
  });
  
  const metabaseMemoryMb = config.requireNumber("metabase-memory");
  const metabaseLogGroup = new aws.cloudwatch.LogGroup("metabase", {
    name: "/ecs/metabase",
    retentionInDays: 30,
  });
  // see: https://github.com/pulumi/pulumi-awsx/blob/master/examples/ecs/nodejs/index.ts
  const metabaseTask = new awsx.ecs.FargateTaskDefinition("metabase", {
    logGroup: { existing: metabaseLogGroup },
    container: {
        name: "metabase",
        // if changing, also check docker-compose.yml
        image: "metabase/metabase:v0.56.6",
        essential: true,
        cpu: config.requireNumber("metabase-cpu"),
        // when changing `memory`, also update `JAVA_OPTS` below
        memory: metabaseMemoryMb,
        portMappings: [{ targetGroup: metabaseTargetGroup }],
        environment: [
          // https://www.metabase.com/docs/latest/troubleshooting-guide/running.html#allocating-more-memory-to-the-jvm
          { name: "JAVA_OPTS", value: getJavaOpts(metabaseMemoryMb) },
          { name: "MB_DB_TYPE", value: "postgres" },
          {
            name: "MB_DB_CONNECTION_URI",
            value: dbUrl,
          },
          { name: "MB_JETTY_HOST", value: "0.0.0.0" },
          { name: "MB_JETTY_PORT", value: String(METABASE_PORT) },
          {
            name: "MB_SITE_URL",
            value: pulumi.interpolate`https://metabase.${DOMAIN}/`,
          },
          // https://www.metabase.com/docs/latest/operations-guide/encrypting-database-details-at-rest.html
          {
            name: "MB_ENCRYPTION_SECRET_KEY",
            value: config.requireSecret("metabase-encryption-secret-key"),
          },
        ],
      }
    });

  const metabaseService = new awsx.ecs.FargateService("metabase", {
      cluster: cluster.arn,
      taskDefinition: metabaseTask.taskDefinition.arn,
      // we get the LB config as an output of the task defn, as computed from the target group passed into port mappings
      loadBalancers: metabaseTask.loadBalancers,
      networkConfiguration: {
        subnets: publicSubnetIds,
        // assignPublicIp: true,
        securityGroups: [metabaseServiceSecurityGroup.id],
      },
      desiredCount: 1,
      // Metabase takes a while to boot up
      healthCheckGracePeriodSeconds: 60 * 15,
      deploymentCircuitBreaker: {
        enable: true,
        rollback: true,
      },
    },
    {
      dependsOn: [metabaseLb],
    }
  );

  setupNotificationForDeploymentRollback(env, "metabase", cluster, metabaseService);
  setupDnsRecord("metabase", DOMAIN, metabaseLb);
  return metabaseService;
}
