"use strict";

import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";

export const createHasuraService = (
  vpc: awsx.ec2.Vpc, 
  networking: pulumi.StackReference,
  certificates: pulumi.StackReference, 
  cluster: awsx.ecs.Cluster, 
  repo: awsx.ecr.Repository, 
  config: pulumi.Config, 
  dbRootUrl: string, 
  CUSTOM_DOMAINS: Record<string, string>[], 
  DOMAIN: string,
) => {
  const lbHasura = new awsx.lb.ApplicationLoadBalancer("hasura", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
  });
  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const HASURA_SERVER_PORT = 80;
  const targetHasura = lbHasura.createTargetGroup("hasura", {
    port: HASURA_SERVER_PORT,
    protocol: "HTTP",
    healthCheck: {
      path: "/healthz",
    },
  });
  // Forward HTTP to HTTPS
  const hasuraListenerHttp = targetHasura.createListener("hasura-http", {
    protocol: "HTTP",
    defaultAction: {
      type: "redirect",
      redirect: {
        protocol: "HTTPS",
        port: "443",
        statusCode: "HTTP_301",
      },
    },
  });
  
  const hasuraListenerHttps = targetHasura.createListener("hasura-https", {
    protocol: "HTTPS",
    sslPolicy: "ELBSecurityPolicy-TLS-1-2-Ext-2018-06",
    certificateArn: certificates.requireOutput("certificateArn"),
  });

  // hasuraService is composed of two tightly coupled containers
  // hasuraServer is publicly exposed (behind the load balancer) and reverse proxies requests to hasuraGraphQLEngine
  // hasuraGraphQLEngine has no externally exposed ports, and can only be accessed by hasuraService
  const hasuraService = new awsx.ecs.FargateService("hasura", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      containers: {
        hasuraServer: {
          image: repo.buildAndPushImage("../../hasura.planx.uk/server"),
          memory: 1024 /*MB*/,
          portMappings: [hasuraListenerHttps],
          environment: [
            { name: "HASURA_SERVER_PORT", value: String(HASURA_SERVER_PORT) },
            { name: "HASURA_GRAPHQL_ENGINE_NETWORK_LOCATION", value: "localhost" },
          ],
        },
        hasuraGraphQLEngine: {
          image: repo.buildAndPushImage("../../hasura.planx.uk"),
          memory: 1024 /*MB*/,
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
          ],
        },
      } 
    },
    desiredCount: 1,
  });
  
  new cloudflare.Record("hasura", {
    name: tldjs.getSubdomain(DOMAIN)
      ? `hasura.${tldjs.getSubdomain(DOMAIN)}`
      : "hasura",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: hasuraListenerHttps.endpoint.hostname,
    ttl: 1,
    proxied: false,
  });
}