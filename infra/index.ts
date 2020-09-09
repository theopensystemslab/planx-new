"use strict";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import * as cloudflare from "@pulumi/cloudflare";
import * as assert from "assert";

const config = new pulumi.Config();

const DB_ROOT_USERNAME = config.require("dbUsername");
const DB_ROOT_PASSWORD = config.require("dbPassword");
const DOMAIN = config.require("domain");
const HASURA_GRAPHQL_ADMIN_SECRET = config.require("hasuraAdminSecret");
const JWT_SECRET = config.require("jwtSecret");
const CLOUDFLARE_ZONE_ID = config.require("cloudflareZoneId"); // Get this from CloudFlare

const API_PATH = "/api";

const repo = new awsx.ecr.Repository("planx");
const vpc = new awsx.ec2.Vpc("planx", {
  numberOfNatGateways: 0
});
const cluster = new awsx.ecs.Cluster("planx", { vpc });

const subnet = new aws.rds.SubnetGroup("planx", {
  subnetIds: vpc.publicSubnetIds
});

// XXX: We might want to switch from RDS to Aurora
const db = new aws.rds.Instance("planx", {
  engine: "postgres",
  // Available versions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html#PostgreSQL.Concepts.General.version12
  engineVersion: "12.3",
  // Available instance types: https://aws.amazon.com/rds/instance-types/
  instanceClass: "db.t2.micro",
  allocatedStorage: 20,
  allowMajorVersionUpgrade: true,
  dbSubnetGroupName: subnet.id,
  vpcSecurityGroupIds: cluster.securityGroups.map((g: any) => g.id),
  name: "planx",
  username: DB_ROOT_USERNAME,
  password: DB_ROOT_PASSWORD,
  skipFinalSnapshot: true
});
const dbRootUrl = pulumi.interpolate`postgres://${DB_ROOT_USERNAME}:${DB_ROOT_PASSWORD}@${db.endpoint}/postgres`;

const lbHasura = new awsx.lb.NetworkLoadBalancer("planx-hasura", {
  external: false,
  vpc: vpc
});
const HASURA_PORT = 80;
const hasuraListener = lbHasura
  .createTargetGroup("planx-hasura", { port: HASURA_PORT })
  .createListener("planx-hasura", { port: 80 });
const hasuraService = new awsx.ecs.FargateService("planx-hasura", {
  cluster,
  taskDefinitionArgs: {
    container: {
      image: repo.buildAndPushImage("./hasura.planx.uk"),
      memory: 512 /*MB*/,
      portMappings: [hasuraListener],
      environment: [
        { name: "HASURA_GRAPHQL_SERVER_PORT", value: String(HASURA_PORT) },
        { name: "HASURA_GRAPHQL_ENABLE_CONSOLE", value: "true" },
        {
          name: "HASURA_GRAPHQL_ADMIN_SECRET",
          value: HASURA_GRAPHQL_ADMIN_SECRET
        },
        { name: "HASURA_GRAPHQL_CORS_DOMAIN", value: "*" },
        {
          name: "HASURA_GRAPHQL_ENABLED_LOG_TYPES",
          value: "startup, http-log, webhook-log, websocket-log, query-log"
        },
        {
          name: "HASURA_GRAPHQL_JWT_SECRET",
          value: `{ "type": "HS256", "key": "${JWT_SECRET}" }`
        },
        { name: "HASURA_GRAPHQL_UNAUTHORIZED_ROLE", value: "user" },
        {
          name: "HASURA_GRAPHQL_DATABASE_URL",
          value: dbRootUrl
        }
      ]
    }
  },
  desiredCount: 1
});

const API_PORT = 80;
const lbApi = new awsx.lb.NetworkLoadBalancer("planx-api", {
  external: false,
  vpc: vpc
});
const apiListener = lbApi
  .createTargetGroup("planx-api", { port: API_PORT })
  .createListener("planx-api", { port: 80 });
const apiService = new awsx.ecs.FargateService("planx-api", {
  cluster,
  taskDefinitionArgs: {
    container: {
      image: repo.buildAndPushImage("./api.planx.uk"),
      memory: 512 /*MB*/,
      portMappings: [apiListener],
      environment: [
        { name: "EDITOR_URL_EXT", value: "TODO" },
        { name: "AWS_S3_REGION", value: "TODO" },
        { name: "AWS_ACCESS_KEY", value: "TODO" },
        { name: "AWS_SECRET_KEY", value: "TODO" },
        { name: "AWS_S3_BUCKET", value: "TODO" },
        { name: "AWS_S3_ACL", value: "TODO" },
        {
          name: "GOOGLE_CLIENT_ID",
          value:
            "987324067365-anl1o207sphdeu28i6nk2e6brec8fh4b.apps.googleusercontent.com"
        },
        { name: "GOOGLE_CLIENT_SECRET", value: "9VPLg_Zc7YmfFHp3lQqbDMIX" },
        { name: "SESSION_SECRET", value: "12345678909876543210" },
        { name: "API_URL_EXT", value: `${DOMAIN}${API_PATH}` },
        { name: "JWT_SECRET", value: JWT_SECRET },
        { name: "PORT", value: String(API_PORT) },
        {
          name: "HASURA_GRAPHQL_ADMIN_SECRET",
          value: HASURA_GRAPHQL_ADMIN_SECRET
        },
        {
          name: "HASURA_GRAPHQL_URL",
          value: pulumi.interpolate`http://${hasuraListener.endpoint.hostname}:${hasuraListener.endpoint.port}/`
        }
      ]
    }
  },
  desiredCount: 1
});

const sharedbService = new awsx.ecs.FargateService("planx-sharedb", {
  cluster,
  taskDefinitionArgs: {
    container: {
      image: repo.buildAndPushImage("./sharedb.planx.uk"),
      memory: 512 /*MB*/,
      environment: [
        { name: "JWT_SECRET", value: JWT_SECRET },
        {
          name: "PG_URL",
          value: dbRootUrl
        }
      ]
    }
  },
  desiredCount: 1
});

const vpcLinkHasura = new aws.apigateway.VpcLink("planx-hasura", {
  targetArn: lbHasura.loadBalancer.arn
});
const vpcLinkApi = new aws.apigateway.VpcLink("planx-api", {
  targetArn: lbApi.loadBalancer.arn
});
const api = new awsx.apigateway.API("planx", {
  stageName: "v1",
  routes: [
    {
      path: "/console",
      target: {
        uri: pulumi.interpolate`http://${hasuraListener.endpoint.hostname}:${hasuraListener.endpoint.port}/`,
        type: "http_proxy",
        connectionType: "VPC_LINK",
        connectionId: vpcLinkHasura.id
      }
    },
    {
      path: "/graphql",
      method: "POST",
      target: {
        uri: pulumi.interpolate`http://${hasuraListener.endpoint.hostname}:${hasuraListener.endpoint.port}/v1/graphql`,
        type: "http_proxy",
        connectionType: "VPC_LINK",
        connectionId: vpcLinkHasura.id
      }
    },
    {
      path: `${API_PATH}`,
      target: {
        uri: pulumi.interpolate`http://${apiListener.endpoint.hostname}:${apiListener.endpoint.port}`,
        type: "http_proxy",
        connectionType: "VPC_LINK",
        connectionId: vpcLinkApi.id
      }
    }
  ]
});
export const apiUrl = api.url;

// https://stackoverflow.com/a/45849093/1456173
const webDnsZone = new aws.route53.Zone("webDnsZone", {
  name: DOMAIN
});

// This has to be in us-east-1 because that's where AWS centralizes its DNS operation
const awsUsEast1 = new aws.Provider("usEast1", { region: "us-east-1" });

const sslCert = new aws.acm.Certificate(
  "sslCert",
  {
    domainName: DOMAIN,
    validationMethod: "DNS"
  },
  { provider: awsUsEast1 }
);

const sslCertValidationRecord = new cloudflare.Record(
  "sslCertValidationRecord",
  {
    name: sslCert.domainValidationOptions[0].resourceRecordName,
    type: sslCert.domainValidationOptions[0].resourceRecordType,
    zoneId: CLOUDFLARE_ZONE_ID,
    value: sslCert.domainValidationOptions[0].resourceRecordValue,
    ttl: 3600
  }
);

// XXX: This can take several minutes (up to an hour maybe)
const sslCertValidationIssued = new aws.acm.CertificateValidation(
  "sslCertValidationIssued",
  {
    certificateArn: sslCert.arn,
    validationRecordFqdns: [sslCertValidationRecord.name]
  },
  { provider: awsUsEast1 }
);
// Configure an edge-optimized domain for our API Gateway. This will configure a Cloudfront CDN
// distribution behind the scenes and serve our API Gateway at a custom domain name over SSL.
const webDomain = new aws.apigateway.DomainName("webCdn", {
  certificateArn: sslCertValidationIssued.certificateArn,
  domainName: DOMAIN
});
const webDomainMapping = new aws.apigateway.BasePathMapping(
  "webDomainMapping",
  {
    restApi: api.restAPI,
    stageName: api.stage.stageName,
    domainName: webDomain.id
  }
);
const cnameRecord = new cloudflare.Record("cnameRecord", {
  name: "@",
  type: "CNAME",
  zoneId: CLOUDFLARE_ZONE_ID,
  value: webDomain.cloudfrontDomainName,
  ttl: 1,
  proxied: true
});
