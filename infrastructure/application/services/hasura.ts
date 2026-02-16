"use strict";

import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";

import { CreateService } from './../types';
import {
  setupLoadBalancerForService,
  setupNotificationForDeploymentRollback,
} from "../utils";

export const createHasuraService = async ({
  env,
  vpcId,
  publicSubnetIds,
  domain,
  cluster,
  repo,
  dbUrl,
  customDomains,
}: CreateService): Promise<awsx.ecs.FargateService> => {
  const config = new pulumi.Config();

  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const HASURA_PROXY_PORT = 80;
  const {
    loadBalancer: hasuraLb,
    targetGroup: hasuraTargetGroup,
    serviceSecurityGroup: hasuraServiceSecurityGroup,
  } = await setupLoadBalancerForService({
    serviceName: "hasura",
    containerPort: HASURA_PROXY_PORT,
    vpcId,
    publicSubnetIds,
    domain,
    healthCheck: { path: "/healthz" },
  });

  // hasuraService is composed of two tightly coupled containers
  // hasuraProxy is publicly exposed (behind the load balancer) and reverse proxies requests to hasura
  // hasura has no externally exposed ports, and can only be accessed via hasuraProxy
  const hasuraProxyImage = new awsx.ecr.Image("hasura-proxy-image", {
    repositoryUrl: repo.url,
    context: "../../apps/hasura.planx.uk/proxy",
  });
  const hasuraImage = new awsx.ecr.Image("hasura-image", {
    repositoryUrl: repo.url,
    context: "../../apps/hasura.planx.uk",
  });

  const hasuraLogGroup = new aws.cloudwatch.LogGroup("hasura", {
    name: "/ecs/hasura",
    retentionInDays: 30,
  });
  const hasuraTask = new awsx.ecs.FargateTaskDefinition("hasura", {
    logGroup: { existing: hasuraLogGroup },
    containers: {
          hasuraProxy: {
            name: "hasuraProxy",
            image: hasuraProxyImage.imageUri,
            essential: true,
            cpu: config.requireNumber("hasura-proxy-cpu"),
            memory: config.requireNumber("hasura-proxy-memory"),
            portMappings: [{ targetGroup: hasuraTargetGroup }],
            // hasuraProxy should wait for the hasura container to spin up before starting
            dependsOn: [
              {
                containerName: "hasura",
                condition: "HEALTHY",
              },
            ],
            healthCheck: {
              // hasuraProxy health depends on hasura health
              // use wget since busybox applet is included in Alpine base image (curl is not)
              command: [
                "CMD-SHELL",
                `wget --spider --quiet http://localhost:${HASURA_PROXY_PORT}/healthz || exit 1`,
              ],
              // generous config; if hasura is saturated/blocking, we give service a chance to scale out before whole task is replaced
              interval: 30,
              timeout: 15,
              retries: 3,
            },
            environment: [
              { name: "HASURA_PROXY_PORT", value: String(HASURA_PROXY_PORT) },
              { name: "HASURA_NETWORK_LOCATION", value: "localhost" },
            ],
          },
          hasura: {
            name: "hasura",
            image: hasuraImage.imageUri,
            essential: true,
            cpu: config.requireNumber("hasura-cpu"),
            memory: config.requireNumber("hasura-memory"),
            // hasuraProxy dependency timeout should mirror migration timeout
            startTimeout: 180,
            stopTimeout: 30,
            healthCheck: {
              command: [
                "CMD-SHELL",
                "curl --head http://localhost:8080/healthz || exit 1",
              ],
              // wait 15s before running container-level health check, using same params as docker-compose
              startPeriod: 15,
              interval: 15,
              timeout: 3,
              retries: 10,
            },
            environment: [
              { name: "HASURA_GRAPHQL_ENABLE_CONSOLE", value: "true" },
              {
                name: "HASURA_GRAPHQL_ADMIN_SECRET",
                value: config.require("hasura-admin-secret"),
              },
              {
                name: "HASURA_GRAPHQL_CORS_DOMAIN",
                value: pulumi
                  .all([customDomains, domain, config.require("lps-domain")])
                  .apply(([customDomains, domain, lpsDomain]) => {
                    const corsUrls = [
                      // Wildcard and exact domains for custom domains
                      ...customDomains.flatMap((x: any) => [
                        `https://*.${x.domain}`,
                        `https://${x.domain}`,
                      ]),
                      // Wildcard and exact domains for main PlanX site
                      `https://*.${domain}`,
                      `https://${domain}`,
                      // Additional domains
                      `https://${lpsDomain}`,
                      "https://planx-website.webflow.io",
                      "https://www.planx.uk",
                    ];

                    return corsUrls.filter(Boolean).join(", ");
                  }),
              },
              {
                name: "HASURA_GRAPHQL_ENABLED_LOG_TYPES",
                value: "startup, http-log, webhook-log, websocket-log, query-log",
              },
              {
                name: "HASURA_GRAPHQL_JWT_SECRET",
                value: pulumi.interpolate`{ "type": "HS256", "key": "${config.require(
                  "jwt-secret"
                )}" }`,
              },
              { name: "HASURA_GRAPHQL_UNAUTHORIZED_ROLE", value: "public" },
              { name: "HASURA_GRAPHQL_DATABASE_URL", value: dbUrl },
              {
                name: "HASURA_PLANX_API_URL",
                value: pulumi.interpolate`https://api.${domain}`,
              },
              {
                name: "HASURA_PLANX_API_KEY",
                value: config.require("hasura-planx-api-key"),
              },
              // extend timeout for migrations during setup to 3 mins (default is 30s)
              {
                name: "HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT",
                value: "180",
              },
              // ensure migrations run sequentially (to manage CPU load)
              {
                name: "HASURA_GRAPHQL_MIGRATIONS_CONCURRENCY",
                value: "1",
              },
              // get more detailed logs during migration (in case of failure)
              {
                name: "HASURA_GRAPHQL_MIGRATIONS_LOG_LEVEL",
                value: "debug",
              },
            ],
          },
        }
    });


  const hasuraService = new awsx.ecs.FargateService("hasura", {
    cluster: cluster.arn,
    taskDefinition: hasuraTask.taskDefinition.arn,
    loadBalancers: hasuraTask.loadBalancers,
    networkConfiguration: {
      subnets: publicSubnetIds,
      assignPublicIp: true,
      securityGroups: [hasuraServiceSecurityGroup.id],
    },
    desiredCount: 1,
    deploymentMinimumHealthyPercent: 50,
    deploymentMaximumPercent: 400,
    // service-level health check grace period should exceed proxy dependency timeout
    healthCheckGracePeriodSeconds: 240,
    deploymentCircuitBreaker: {
      enable: true,
      rollback: true,
    },
  },
  {
    dependsOn: [hasuraLb],
  });
  setupNotificationForDeploymentRollback(env, "hasura", cluster, hasuraService);

  // XXX: consider setting up similar auto-scaling policies for services other than Hasura?
  const hasuraScalingTarget = new aws.appautoscaling.Target("hasura-scaling-target", {
    // maxCapacity should consider compute power of the RDS instance which Hasura relies on
    maxCapacity: parseInt(config.require("hasura-service-scaling-maximum")),
    // minCapacity should reflect the baseline load expected
    // see: https://hasura.io/docs/2.0/deployment/performance-tuning/#scalability
    minCapacity: parseInt(config.require("hasura-service-scaling-minimum")),
    resourceId: pulumi.interpolate`service/${cluster.name}/${hasuraService.service.name}`,
    scalableDimension: "ecs:service:DesiredCount",
    serviceNamespace: "ecs",
  });

  const hasuraCpuScaling = new aws.appautoscaling.Policy("hasura-cpu-scaling", {
    policyType: "TargetTrackingScaling",
    resourceId: hasuraScalingTarget.resourceId,
    scalableDimension: hasuraScalingTarget.scalableDimension,
    serviceNamespace: hasuraScalingTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
            predefinedMetricType: "ECSServiceAverageCPUUtilization",
        },
        // scale out quickly for responsiveness, but scale in more slowly to avoid thrashing
        targetValue: 30.0,
        scaleInCooldown: 300,
        scaleOutCooldown: 60,
    },
  });

  const hasuraMemoryScaling = new aws.appautoscaling.Policy("hasura-memory-scaling", {
    policyType: "TargetTrackingScaling",
    resourceId: hasuraScalingTarget.resourceId,
    scalableDimension: hasuraScalingTarget.scalableDimension,
    serviceNamespace: hasuraScalingTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
            predefinedMetricType: "ECSServiceAverageMemoryUtilization",
        },
        targetValue: 30.0,
        scaleInCooldown: 300,
        scaleOutCooldown: 60,
    },
  });

  new cloudflare.DnsRecord("hasura", {
    name: tldjs.getSubdomain(domain)
      ? `hasura.${tldjs.getSubdomain(domain)}`
      : "hasura",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    content: hasuraLb.loadBalancer.dnsName,
    ttl: 1,
    proxied: true,
  });

  setupNotificationForDeploymentRollback(env, "hasura", cluster, hasuraService);
  return hasuraService;
}
