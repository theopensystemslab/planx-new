"use strict";

import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";

import { CreateService } from './../types';
import {
  addRedirectToCloudFlareListenerRule,
  setupNotificationForDeploymentRollback,
} from "../utils";

export const createHasuraService = async ({
  env,
  vpc,
  cluster,
  repo,
  dbUrl,
  CUSTOM_DOMAINS,
  stacks: {
    networking, certificates, data,
  },
}: CreateService): Promise<awsx.ecs.FargateService> => {

  const config = new pulumi.Config();
  const DOMAIN: string = await certificates.requireOutputValue("domain");

  const lbHasura = new awsx.lb.ApplicationLoadBalancer("hasura", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
  });
  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const HASURA_PROXY_PORT = 80;
  const targetHasura = lbHasura.createTargetGroup("hasura", {
    port: HASURA_PROXY_PORT,
    protocol: "HTTP",
    healthCheck: {
      path: "/healthz",
    },
  });  
  const hasuraListenerHttp = targetHasura.createListener("hasura-http", { protocol: "HTTP" });

  addRedirectToCloudFlareListenerRule({
    serviceName: "hasura",
    listener: hasuraListenerHttp,
    domain: DOMAIN,
  });

  // hasuraService is composed of two tightly coupled containers
  // hasuraProxy is publicly exposed (behind the load balancer) and reverse proxies requests to hasura
  // hasura has no externally exposed ports, and can only be accessed by hasuraService
  const hasuraService = new awsx.ecs.FargateService("hasura", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    desiredCount: 1,
    deploymentMinimumHealthyPercent: 50,
    deploymentMaximumPercent: 200,
    // service-level health check grace period should exceed proxy dependency timeout
    healthCheckGracePeriodSeconds: 240,
    deploymentCircuitBreaker: {
      enable: true,
      rollback: true,
    },
    taskDefinitionArgs: {
      logGroup: new aws.cloudwatch.LogGroup("hasura", {
        namePrefix: "hasura",
        retentionInDays: 30,
      }),
      containers: {
        hasuraProxy: {
          image: repo.buildAndPushImage("../../apps/hasura.planx.uk/proxy"),
          cpu: config.requireNumber("hasura-proxy-cpu"),
          memory: config.requireNumber("hasura-proxy-memory"),
          portMappings: [hasuraListenerHttp],
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
          // hasuraProxy dependency timeout should mirror migration timeout
          startTimeout: 180,
          stopTimeout: 30,
          image: repo.buildAndPushImage("../../apps/hasura.planx.uk"),
          cpu: config.requireNumber("hasura-cpu"),
          memory: config.requireNumber("hasura-memory"),
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
                .all([CUSTOM_DOMAINS, DOMAIN, config.require("lps-domain")])
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
              value: `https://api.${DOMAIN}`,
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
      },
    },
  });

  // TODO: bump awsx to 1.x to use the FargateService scaleConfig option to replace more verbose config below
  const hasuraScalingTarget = new aws.appautoscaling.Target("hasura-scaling-target", {
    // maxCapacity should consider compute power of the RDS instance which Hasura relies on
    maxCapacity: parseInt(config.require("hasura-service-scaling-maximum")),
    // minCapacity should reflect the baseline load expected
    // see: https://hasura.io/docs/2.0/deployment/performance-tuning/#scalability
    minCapacity: parseInt(config.require("hasura-service-scaling-minimum")),
    resourceId: pulumi.interpolate`service/${cluster.cluster.name}/${hasuraService.service.name}`,
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

  new cloudflare.Record("hasura", {
    name: tldjs.getSubdomain(DOMAIN)
      ? `hasura.${tldjs.getSubdomain(DOMAIN)}`
      : "hasura",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: hasuraListenerHttp.endpoint.hostname,
    ttl: 1,
    proxied: true,
  });

  setupNotificationForDeploymentRollback(env, "hasura", cluster, hasuraService);
  return hasuraService;
}
