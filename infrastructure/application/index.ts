"use strict";

import * as fsWalk from "@nodelib/fs.walk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as postgres from "@pulumi/postgresql";
import * as mime from "mime";
import * as tldjs from "tldjs";
import * as url from "url";

const config = new pulumi.Config();

const env = pulumi.getStack();
const certificates = new pulumi.StackReference(`planx/certificates/${env}`);
const networking = new pulumi.StackReference(`planx/networking/${env}`);
const data = new pulumi.StackReference(`planx/data/${env}`);

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the CloudFlare API token is missing.
new pulumi.Config("cloudflare").require("apiToken");

(async function main() {
  const DOMAIN = await certificates.requireOutputValue("domain");

  const repo = new awsx.ecr.Repository("repo");

  const vpc = awsx.ec2.Vpc.fromExistingIds("vpc", {
    vpcId: networking.requireOutput("vpcId"),
  });
  const cluster = new awsx.ecs.Cluster("cluster", {
    cluster: networking.requireOutput("clusterName"),
    vpc,
  });

  const dbRootUrl = await data.requireOutputValue("dbRootUrl");

  // ----------------------- Metabase
  const pgRoot = url.parse(dbRootUrl);
  const provider = new postgres.Provider("metabase", {
    host: pgRoot.hostname as string,
    port: Number(pgRoot.port),
    username: pgRoot.auth!.split(":")[0] as string,
    password: pgRoot.auth!.split(":")[1] as string,
    database: pgRoot.path!.substring(1) as string,
    superuser: false,
  });
  const metabasePgPassword = config.require("metabasePgPassword");
  const role = new postgres.Role(
    "metabase",
    {
      name: "metabase",
      login: true,
      password: metabasePgPassword,
    },
    { provider }
  );
  const metabasePgDatabase = new postgres.Database(
    "metabase",
    {
      name: role.name,
      owner: role.name,
    },
    {
      provider,
    }
  );

  const METABASE_PORT = 3000;
  const lbMetabase = new awsx.lb.ApplicationLoadBalancer("metabase", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
    securityGroups: [
      new awsx.ec2.SecurityGroup("metabase-custom-port", {
        vpc,
        ingress: [
          {
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
            fromPort: 443,
            toPort: 443,
          },
        ],
        egress: [
          {
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
            fromPort: METABASE_PORT,
            toPort: METABASE_PORT,
          },
        ],
      }),
    ],
  });
  const targetMetabase = lbMetabase.createTargetGroup("metabase", {
    port: METABASE_PORT,
    protocol: "HTTP",
    healthCheck: {
      path: "/api/health",
      // XXX: Attempt to fix "504 Gateway Time-out"
      healthyThreshold: 2,
      interval: 300,
      timeout: 120,
      unhealthyThreshold: 10,
    },
  });
  // Forward HTTP to HTTPS
  const metabaseListenerHttp = targetMetabase.createListener("metabase-http", {
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
  const metabaseListenerHttps = targetMetabase.createListener(
    "metabase-https",
    {
      protocol: "HTTPS",
      certificateArn: certificates.requireOutput("certificateArn"),
    }
  );
  const metabaseService = new awsx.ecs.FargateService("metabase", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      container: {
        // if changing, also check docker-compose.yml
        image: "metabase/metabase:v0.41.5",
        memory: 2048 /*MB*/,
        portMappings: [metabaseListenerHttps],
        environment: [
          { name: "MB_DB_TYPE", value: "postgres" },
          {
            name: "MB_DB_CONNECTION_URI",
            value: pulumi.interpolate`postgres://${role.name}:${metabasePgPassword}@${pgRoot.hostname}:${pgRoot.port}/${metabasePgDatabase.name}`,
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
            value: config.require("metabase-encryption-secret-key"),
          },
        ],
      },
    },
    desiredCount: 1,
    // Metabase takes a while to boot up
    healthCheckGracePeriodSeconds: 60 * 15,
  });

  new cloudflare.Record("metabase", {
    name: tldjs.getSubdomain(DOMAIN)
      ? `metabase.${tldjs.getSubdomain(DOMAIN)}`
      : "metabase",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: metabaseListenerHttps.endpoint.hostname,
    ttl: 1,
    proxied: false,
  });

  // ----------------------- Hasura
  const lbHasura = new awsx.lb.ApplicationLoadBalancer("hasura", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
  });
  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const HASURA_PORT = 80;
  const targetHasura = lbHasura.createTargetGroup("hasura", {
    port: HASURA_PORT,
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
    certificateArn: certificates.requireOutput("certificateArn"),
  });
  const hasuraService = new awsx.ecs.FargateService("hasura", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      container: {
        image: repo.buildAndPushImage("../../hasura.planx.uk"),
        memory: 512 /*MB*/,
        portMappings: [hasuraListenerHttps],
        environment: [
          { name: "HASURA_GRAPHQL_SERVER_PORT", value: String(HASURA_PORT) },
          { name: "HASURA_GRAPHQL_ENABLE_CONSOLE", value: "true" },
          {
            name: "HASURA_GRAPHQL_ADMIN_SECRET",
            value: config.require("hasura-admin-secret"),
          },
          { name: "HASURA_GRAPHQL_CORS_DOMAIN", value: "*" },
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
        ],
      },
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

  // ----------------------- API
  const apiBucket = aws.s3.Bucket.get(
    "bucket",
    data.requireOutput("apiBucketId")
  );
  const apiUser = new aws.iam.User("api-user");
  const apiUserAccessKey = new aws.iam.AccessKey("api-user-access-key", {
    user: apiUser.name,
  });
  // Grant the user access to the bucket
  new aws.iam.UserPolicy("api-user-role", {
    user: apiUser.name,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "s3:*",
          Resource: apiBucket.arn,
        },
      ],
    },
  });
  new aws.s3.BucketPolicy("api-bucket-policy", {
    bucket: apiBucket.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "ApiWriteObject",
          Effect: "Allow",
          Principal: { AWS: [apiUser.arn] },
          // XXX: We could narrow this down to the action `PutObject`
          Action: ["s3:*"],
          Resource: [pulumi.interpolate`${apiBucket.arn}/*`],
        },
      ],
    },
  });

  const lbApi = new awsx.lb.ApplicationLoadBalancer("api", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
  });
  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const API_PORT = 80;
  const targetApi = lbApi.createTargetGroup("api", {
    port: API_PORT,
    protocol: "HTTP",
    healthCheck: {
      path: "/",
    },
  });
  // Forward HTTP to HTTPS
  const apiListenerHttp = targetApi.createListener("api-http", {
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
  const apiListenerHttps = targetApi.createListener("api-https", {
    protocol: "HTTPS",
    certificateArn: certificates.requireOutput("certificateArn"),
  });
  const apiService = new awsx.ecs.FargateService("api", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      container: {
        image: repo.buildAndPushImage("../../api.planx.uk"),
        memory: 512 /*MB*/,
        portMappings: [apiListenerHttps],
        environment: [
          { name: "NODE_ENV", value: "production" },
          { name: "EDITOR_URL_EXT", value: `https://${DOMAIN}` },
          { name: "AWS_S3_REGION", value: apiBucket.region },
          { name: "AWS_ACCESS_KEY", value: apiUserAccessKey.id },
          { name: "AWS_SECRET_KEY", value: apiUserAccessKey.secret },
          {
            name: "AWS_S3_BUCKET",
            value: pulumi.interpolate`${apiBucket.bucket}`,
          },
          { name: "AWS_S3_ACL", value: "public-read" },
          {
            name: "GOOGLE_CLIENT_ID",
            value: config.require("google-client-id"),
          },
          {
            name: "GOOGLE_CLIENT_SECRET",
            value: config.require("google-client-secret"),
          },
          { name: "SESSION_SECRET", value: config.require("session-secret") },
          { name: "API_URL_EXT", value: `https://api.${DOMAIN}` },
          {
            name: "BOPS_API_ROOT_DOMAIN",
            value: config.require("bops-api-root-domain"),
          },
          { name: "BOPS_API_TOKEN", value: config.require("bops-api-token") },
          { name: "JWT_SECRET", value: config.require("jwt-secret") },
          { name: "PORT", value: String(API_PORT) },
          {
            name: "HASURA_GRAPHQL_ADMIN_SECRET",
            value: config.require("hasura-admin-secret"),
          },
          {
            name: "HASURA_GRAPHQL_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v1/graphql`,
          },
          ...["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].map((authority) => ({
            name: `GOV_UK_PAY_TOKEN_${authority}`,
            value: config.require(
              `gov-uk-pay-token-${authority}`.toLowerCase()
            ),
          })),
          {
            name: "AIRBRAKE_PROJECT_ID",
            value: config.require("airbrake-project-id"),
          },
          {
            name: "AIRBRAKE_PROJECT_KEY",
            value: config.require("airbrake-project-key"),
          },
        ],
      },
    },
    desiredCount: 1,
  });
  new cloudflare.Record("api", {
    name: tldjs.getSubdomain(DOMAIN)
      ? `api.${tldjs.getSubdomain(DOMAIN)}`
      : "api",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: apiListenerHttps.endpoint.hostname,
    ttl: 1,
    proxied: false,
  });

  // ----------------------- ShareDB
  const lbSharedb = new awsx.lb.ApplicationLoadBalancer("sharedb", {
    external: true,
    vpc,
    subnets: networking.requireOutput("publicSubnetIds"),
  });
  // XXX: If you change the port, you'll have to make the security group accept incoming connections on the new port
  const SHAREDB_PORT = 80;
  const targetSharedb = lbSharedb.createTargetGroup("sharedb", {
    port: SHAREDB_PORT,
    protocol: "HTTP",
    healthCheck: {
      path: "/",
      matcher: "426", // "HTTP 426 Upgrade Required"
    },
    stickiness: {
      enabled: true,
      type: "lb_cookie",
    },
  });
  // Forward HTTP to HTTPS
  const sharedbListenerHttp = targetSharedb.createListener("sharedb-http", {
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
  const sharedbListenerHttps = targetSharedb.createListener("sharedb-https", {
    protocol: "HTTPS",
    certificateArn: certificates.requireOutput("certificateArn"),
  });
  const sharedbService = new awsx.ecs.FargateService("sharedb", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      container: {
        image: repo.buildAndPushImage("../../sharedb.planx.uk"),
        memory: 512 /*MB*/,
        portMappings: [sharedbListenerHttps],
        environment: [
          { name: "PORT", value: String(SHAREDB_PORT) },
          {
            name: "JWT_SECRET",
            value: config.require("jwt-secret"),
          },
          {
            name: "PG_URL",
            value: dbRootUrl,
          },
        ],
      },
    },
    desiredCount: 1,
  });

  const sharedbDnsRecord = new cloudflare.Record("sharedb", {
    name: tldjs.getSubdomain(DOMAIN)
      ? `sharedb.${tldjs.getSubdomain(DOMAIN)}`
      : "sharedb",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: sharedbListenerHttps.endpoint.hostname,
    ttl: 1,
    proxied: false,
  });

  // ------------------- Frontend
  const frontendBucket = new aws.s3.Bucket(`${DOMAIN}`, {
    bucket: DOMAIN,
    website: {
      indexDocument: "index.html",
      errorDocument: "index.html",
    },
  });

  fsWalk
    .walkSync("../../editor.planx.uk/build/", {
      basePath: "",
      entryFilter: (e) => !e.dirent.isDirectory(),
    })
    .forEach(({ path }) => {
      const relativeFilePath = `../../editor.planx.uk/build/${path}`;
      const contentType = mime.getType(relativeFilePath) || "";
      const contentFile = new aws.s3.BucketObject(
        relativeFilePath,
        {
          key: path,
          acl: "public-read",
          bucket: frontendBucket,
          contentType,
          source: new pulumi.asset.FileAsset(relativeFilePath),
          // https://web.dev/stale-while-revalidate/
          cacheControl: contentType.includes("html")
            ? undefined
            : `max-age=${1}, stale-while-revalidate=${60 * 60 * 24}`,
        },
        {
          parent: frontendBucket,
        }
      );
    });

  const logsBucket = new aws.s3.Bucket("requestLogs", {
    bucket: `${DOMAIN}-logs`,
    acl: "private",
  });

  // Generate Origin Access Identity to access the private s3 bucket.
  const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(
    "originAccessIdentity",
    {
      comment: "This is needed to setup s3 polices and make s3 not public.",
    }
  );
  const cdn = new aws.cloudfront.Distribution(`${DOMAIN}-cdn`, {
    enabled: true,
    // Could include `www.${DOMAIN}` here if the `www` subdomain is desired
    aliases: [DOMAIN],
    origins: [
      {
        originId: frontendBucket.arn,
        domainName: frontendBucket.websiteEndpoint,
        s3OriginConfig: {
          originAccessIdentity:
            originAccessIdentity.cloudfrontAccessIdentityPath,
        },
      },
    ],

    defaultRootObject: "index.html",

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
      targetOriginId: frontendBucket.arn,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD", "OPTIONS"],
      forwardedValues: {
        cookies: { forward: "none" },
        queryString: false,
      },
      compress: true,
      minTtl: 0,
      defaultTtl: 60 * 10,
      maxTtl: 60 * 10,
      responseHeadersPolicyId: new aws.cloudfront.ResponseHeadersPolicy(
        `${DOMAIN}-policy`,
        {
          corsConfig: {
            accessControlAllowCredentials: true,
            accessControlAllowHeaders: {
              items: ["*"],
            },
            accessControlAllowMethods: {
              items: ["GET", "HEAD", "OPTIONS"],
            },
            // TODO: Narrow this down to the list of domain names we're actually using
            accessControlAllowOrigins: {
              items: ["*"],
            },
            originOverride: true,
          },
          securityHeadersConfig: {
            // Prevent iFrames
            frameOptions: {
              frameOption: "DENY",
              override: true,
            },
            // Implements HTTP Strict Transport Security
            strictTransportSecurity: {
              accessControlMaxAgeSec: 63072000, // maximum (2 years)
              override: true,
              includeSubdomains: true,
              preload: true,
            },
          },
        }
      ).id,
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad, and also the least expensive.
    priceClass: "PriceClass_100",

    // You can customize error responses. When CloudFront receives an error from the origin (e.g. S3 or some other
    // web service) it can return a different error code, and return the response for a different resource.
    customErrorResponses: [
      { errorCode: 404, responseCode: 200, responsePagePath: "/index.html" },
    ],

    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },

    viewerCertificate: {
      acmCertificateArn: certificates.requireOutput("certificateArn"),
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },

    loggingConfig: {
      bucket: logsBucket.bucketDomainName,
      includeCookies: false,
      prefix: `${DOMAIN}/`,
    },
  });

  const frontendDnsRecord = new cloudflare.Record("frontend", {
    name: tldjs.getSubdomain(DOMAIN) ?? "@",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: cdn.domainName,
    ttl: 1,
    proxied: true,
  });
})();

new aws.budgets.Budget("general-budget", {
  budgetType: "COST",
  limitAmount: "300",
  limitUnit: "USD",
  timePeriodStart: "2020-05-01_00:00",
  timeUnit: "MONTHLY",
  notifications: [
    {
      comparisonOperator: "GREATER_THAN",
      notificationType: "FORECASTED",
      threshold: 100,
      thresholdType: "PERCENTAGE",
      subscriberEmailAddresses: ["devops@opensystemslab.io"],
    },
  ],
});
