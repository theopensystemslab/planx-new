"use strict";

import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";

export const createHasuraCaddyTest = (
  vpc: any, 
  networking: any,
  certificates: any, 
  cluster: any, 
  repo: any, 
  config: any, 
  dbRootUrl: any, 
  CUSTOM_DOMAINS: any, 
  DOMAIN: any,
) => {
  const lbHasura = new awsx.lb.ApplicationLoadBalancer("hasura-test", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
  });
  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const HASURA_PORT = 80;
  const targetHasura = lbHasura.createTargetGroup("hasura-test", {
    port: HASURA_PORT,
    protocol: "HTTP",
    healthCheck: {
      path: "/healthz",
    },
  });
  // Forward HTTP to HTTPS
  const hasuraListenerHttp = targetHasura.createListener("hasura-http-test", {
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
  
  const hasuraListenerHttps = targetHasura.createListener("hasura-https-test", {
    protocol: "HTTPS",
    sslPolicy: "ELBSecurityPolicy-TLS-1-2-Ext-2018-06",
    certificateArn: certificates.requireOutput("certificateArn"),
  });
  const hasuraService = new awsx.ecs.FargateService("hasura-test", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      containers: {
        hasuraGraphQLEngine: {
          image: repo.buildAndPushImage("../../hasura.planx.uk"),
          memory: 1024 /*MB*/,
          environment: [
            { name: "HASURA_GRAPHQL_SERVER_PORT", value: String(8080) },
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
        hasuraServer: {
          image: repo.buildAndPushImage("../../hasura.planx.uk/server"),
          memory: 1024 /*MB*/,
          portMappings: [hasuraListenerHttps],
          environment: [
            { name: "HASURA_PORT", value: String(HASURA_PORT) },
            { name: "HASURA_GRAPHQL_PORT", value: "8080" },
            { name: "DOMAIN", value: DOMAIN },
          ],
        }
      } 
    },
    desiredCount: 1,
  });
  
  new cloudflare.Record("hasura-test", {
    name: tldjs.getSubdomain(DOMAIN)
      ? `hasura-test.${tldjs.getSubdomain(DOMAIN)}`
      : "hasura-test",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: lbHasura.loadBalancer.dnsName,
    ttl: 1,
    proxied: false,
  });
}