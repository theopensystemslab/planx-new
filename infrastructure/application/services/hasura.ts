"use strict";

import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";

import { CreateService } from './../types';
import { addRedirectToCloudFlareListenerRule } from "../utils/addListenerRule";

export const createHasuraService = async ({
  vpc,
  cluster,
  repo,
  CUSTOM_DOMAINS, 
  stacks: {
    networking, certificates, data,
  },
}: CreateService) => {

  const config = new pulumi.Config();
  const dbRootUrl: string = await data.requireOutputValue("dbRootUrl");
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
      interval: 30,
      timeout: 10,
      healthyThreshold: 3,
      unhealthyThreshold: 5,
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
    // extend service-level health check grace period to match hasura server migrations timeout
    healthCheckGracePeriodSeconds: 600,
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
          image: repo.buildAndPushImage("../../hasura.planx.uk/proxy"),
          cpu: config.requireNumber("hasura-proxy-cpu"),
          memory: config.requireNumber("hasura-proxy-memory"),
          portMappings: [hasuraListenerHttp],
          // hasuraProxy should wait for the hasura container to spin up before starting
          dependsOn: [{
            containerName: "hasura",
            condition: "HEALTHY"
          }],
          healthCheck: {
            // hasuraProxy health depends on hasura health
            command: ["CMD-SHELL", `curl --head http://localhost:${HASURA_PROXY_PORT}/healthz || exit 1`],
            interval: 15,
            timeout: 3,
            retries: 3,
          },
          environment: [
            { name: "HASURA_PROXY_PORT", value: String(HASURA_PROXY_PORT) },
            { name: "HASURA_NETWORK_LOCATION", value: "localhost" },
          ],
        },
        hasura: {
          // hasuraProxy dependency timeout should mirror migration timeout
          startTimeout: 600,
          stopTimeout: 120,
          image: repo.buildAndPushImage("../../hasura.planx.uk"),
          cpu: config.requireNumber("hasura-cpu"),
          memory: config.requireNumber("hasura-memory"),
          healthCheck: {
            command: ["CMD-SHELL", "curl --head http://localhost:8080/healthz || exit 1"],
            // wait 5m before running container-level health check, using same params as docker-compose
            startPeriod: 300,
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
              value: [...CUSTOM_DOMAINS.map((x: any) => x.domain), DOMAIN]
                .map((x) => `https://*.${x}, https://${x}`)
                .join(", "),
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
            {
              name: "HASURA_GRAPHQL_DATABASE_URL",
              value: dbRootUrl,
            },
            {
              name: "HASURA_PLANX_API_URL",
              value: `https://api.${DOMAIN}`,
            },
            {
              name: "HASURA_PLANX_API_KEY",
              value: config.require("hasura-planx-api-key"),
            },
            // extend timeout for migrations during setup to 10 mins (default is 30s)
            {
              name: "HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT",
              value: "600",
            },
            // ensure migrations run sequentially
            {
              name: "HASURA_GRAPHQL_MIGRATIONS_CONCURRENCY",
              value: "1",
            },
            // get more detailed logs during attempted migration
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
    // start conservative, can always bump max as required
    maxCapacity: 3,
    minCapacity: 1,
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
        targetValue: 60.0,
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
        targetValue: 75.0,
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
}