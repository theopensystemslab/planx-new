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

import { generateTeamSecrets } from "./utils/generateTeamSecrets";
import { createHasuraService } from "./services/hasura";
import { addRedirectToCloudFlareListenerRule } from "./utils/addListenerRule";

const config = new pulumi.Config();

const env = pulumi.getStack();
const certificates = new pulumi.StackReference(`planx/certificates/${env}`);
const networking = new pulumi.StackReference(`planx/networking/${env}`);
const data = new pulumi.StackReference(`planx/data/${env}`);

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the CloudFlare API token is missing.
// You can generate tokens here: https://dash.cloudflare.com/profile/api-tokens
new pulumi.Config("cloudflare").requireSecret("apiToken");

const CUSTOM_DOMAINS =
  env === "production"
    ? [
        {
          domain: "planningservices.buckinghamshire.gov.uk",
          name: "bucks",
        },
        {
          domain: "planningservices.southwark.gov.uk",
          name: "southwark",
        },
        {
          domain: "planningservices.lambeth.gov.uk",
          name: "lambeth",
        },
        {
          domain: "planningservices.doncaster.gov.uk",
          name: "doncaster",
        },
        {
          domain: "planningservices.medway.gov.uk",
          name: "medway",
        },
        {
          domain: "planningservices.newcastle.gov.uk",
          name: "newcastle",
        },
        {
          domain: "planningservices.stalbans.gov.uk",
          name: "stalbans",
        },
        {
          domain: "planningservices.camden.gov.uk",
          name: "camden",
        },
      ]
    : [];

export = async () => {
  const DOMAIN: string = await certificates.requireOutputValue("domain");

  const repo = new awsx.ecr.Repository("repo");

  const vpc = awsx.ec2.Vpc.fromExistingIds("vpc", {
    vpcId: networking.requireOutput("vpcId"),
  });
  const cluster = new awsx.ecs.Cluster("cluster", {
    cluster: networking.requireOutput("clusterName"),
    vpc,
  });

  const dbRootUrl: string = await data.requireOutputValue("dbRootUrl");

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
  const metabasePgPassword = config.requireSecret("metabasePgPassword");
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
  const metabaseListenerHttp = targetMetabase.createListener(
    "metabase-http", { protocol: "HTTP" }
  );

  addRedirectToCloudFlareListenerRule({
    serviceName: "metabase",
    listener: metabaseListenerHttp,
    domain: DOMAIN,
  });
  
  const metabaseService = new awsx.ecs.FargateService("metabase", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      logGroup: new aws.cloudwatch.LogGroup("metabase", {
        namePrefix: "metabase",
        retentionInDays: 30,
      }),
      container: {
        // if changing, also check docker-compose.yml
        image: "metabase/metabase:v0.47.8",
        portMappings: [metabaseListenerHttp],
        // When changing `memory`, also update `JAVA_OPTS` below
        memory: 4096 /*MB*/,
        environment: [
          // https://www.metabase.com/docs/latest/troubleshooting-guide/running.html#heap-space-outofmemoryerrors
          { name: "JAVA_OPTS", value: `-Xmx2g` },
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
            value: config.requireSecret("metabase-encryption-secret-key"),
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
    value: metabaseListenerHttp.endpoint.hostname,
    ttl: 1,
    proxied: true,
  });

  // ----------------------- Hasura
  createHasuraService({
    vpc,
    cluster,
    repo,
    CUSTOM_DOMAINS,
    stacks: {
      networking,
      certificates,
      data,
    },
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
    idleTimeout: 120,
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
  const apiListenerHttp = targetApi.createListener("api-http", {
    protocol: "HTTP",
  });

  addRedirectToCloudFlareListenerRule({
    serviceName: "api",
    listener: apiListenerHttp,
    domain: DOMAIN,
  });

  const apiService = new awsx.ecs.FargateService("api", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      logGroup: new aws.cloudwatch.LogGroup("api", {
        namePrefix: "api",
        retentionInDays: 30,
      }),
      container: {
        image: repo.buildAndPushImage({
          context: "../../api.planx.uk",
          target: "production",
        }),
        cpu: 2048,
        memory: 4096 /*MB*/,
        portMappings: [apiListenerHttp],
        environment: [
          { name: "NODE_ENV", value: env },
          { name: "APP_ENVIRONMENT", value: env },
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
            name: "FILE_API_KEY",
            value: config.requireSecret("file-api-key"),
          },
          {
            name: "GOOGLE_CLIENT_ID",
            value: config.require("google-client-id"),
          },
          {
            name: "GOOGLE_CLIENT_SECRET",
            value: config.requireSecret("google-client-secret"),
          },
          { name: "SESSION_SECRET", value: config.requireSecret("session-secret") },
          { name: "API_URL_EXT", value: `https://api.${DOMAIN}` },
          { name: "BOPS_API_TOKEN", value: config.requireSecret("bops-api-token") },
          { name: "JWT_SECRET", value: config.requireSecret("jwt-secret") },
          { name: "PORT", value: String(API_PORT) },
          {
            name: "HASURA_GRAPHQL_ADMIN_SECRET",
            value: config.requireSecret("hasura-admin-secret"),
          },
          {
            name: "HASURA_GRAPHQL_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v1/graphql`,
          },
          {
            name: "HASURA_METADATA_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v1/metadata`,
          },
          {
            name: "HASURA_SCHEMA_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v2/query`,
          },
          {
            name: "HASURA_PLANX_API_KEY",
            value: config.requireSecret("hasura-planx-api-key"),
          },
          {
            name: "AIRBRAKE_PROJECT_ID",
            value: config.requireSecret("airbrake-project-id"),
          },
          {
            name: "AIRBRAKE_PROJECT_KEY",
            value: config.requireSecret("airbrake-project-key"),
          },
          {
            name: "UNIFORM_TOKEN_URL",
            value: config.requireSecret("uniform-token-url"),
          },
          {
            name: "UNIFORM_SUBMISSION_URL",
            value: config.requireSecret("uniform-submission-url"),
          },
          {
            name: "GOVUK_NOTIFY_API_KEY",
            value: config.requireSecret("govuk-notify-api-key"),
          },
          {
            name: "SLACK_WEBHOOK_URL",
            value: config.requireSecret("slack-webhook-url"),
          },
          {
            name: "ORDNANCE_SURVEY_API_KEY",
            value: config.requireSecret("ordnance-survey-api-key"),
          },
          ...generateTeamSecrets(config, env),
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
    zoneId: config.requireSecret("cloudflare-zone-id"),
    value: apiListenerHttp.endpoint.hostname,
    ttl: 1,
    proxied: true,
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
  const sharedbListenerHttp = targetSharedb.createListener("sharedb-http", { protocol: "HTTP" });

  addRedirectToCloudFlareListenerRule({
    serviceName: "sharedb",
    listener: sharedbListenerHttp,
    domain: DOMAIN,
  });

  const sharedbService = new awsx.ecs.FargateService("sharedb", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      logGroup: new aws.cloudwatch.LogGroup("sharedb", {
        namePrefix: "sharedb",
        retentionInDays: 30,
      }),
      container: {
        image: repo.buildAndPushImage("../../sharedb.planx.uk"),
        memory: 512 /*MB*/,
        portMappings: [sharedbListenerHttp],
        environment: [
          { name: "PORT", value: String(SHAREDB_PORT) },
          {
            name: "JWT_SECRET",
            value: config.requireSecret("jwt-secret"),
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
    value: sharedbListenerHttp.endpoint.hostname,
    ttl: 1,
    proxied: true,
  });

  // ------------------- Frontend
  const frontendBucket = new aws.s3.Bucket(`${DOMAIN}`, {
    bucket: DOMAIN,
    website: {
      indexDocument: "index.html",
      errorDocument: "error.html",
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

  // XXX: Originally, our certificate (generated in the `certificates` stack) was created in eu-west-2 (London), however, later we wanted to add CloudFront which only accepts certificates generated in the us-east-1 region. Hence, this here is duplicate code which should be merged into the `certificate` stack.
  const usEast1 = new aws.Provider("useast1", { region: "us-east-1" });

  const customDomains = ((): Array<any> => {
    return CUSTOM_DOMAINS.map(createCustomDomain);

    function createCustomDomain({
      domain,
      name,
    }: {
      domain: string;
      name: string;
    }) {
      // These certificates are created on the `application` stack (as opposed to the `certificates` stack) they're certificates generated by third-party. We're just importing into AWS ACM.
      const certificate = new aws.acm.Certificate(
        `sslCert-${name}`,
        {
          // File starting with `-----BEGIN PRIVATE KEY-----`
          privateKey: config.requireSecret(`ssl-${name}-key`),
          // File starting with `-----BEGIN CERTIFICATE-----`
          certificateBody: config.requireSecret(`ssl-${name}-cert`),
          // File starting with `-----BEGIN CERTIFICATE-----`
          // AWS calls it "Chain" but it's usually called "intermediate"
          // This is optional, not all teams will provide one
          certificateChain: config.getSecret(`ssl-${name}-chain`),
        },
        {
          provider: usEast1,
        }
      );
      const cdn = createCdn({ domain, acmCertificateArn: certificate.arn });
      return { domain, cname: cdn.domainName };
    }
  })();

  const sslCert = new aws.acm.Certificate(
    `sslCert`,
    {
      // XXX: For wildcards remember that *.example.com will only cover a single level subdomain such as www.example.com not secondary levels such as beta.www.example.com.
      domainName: `${DOMAIN}`,
      validationMethod: "DNS",
      subjectAlternativeNames: [
        // Root
        `${DOMAIN}`,
        // Wildcard / subdomains
        `*.${DOMAIN}`,
      ],
    },
    {
      provider: usEast1,
      // XXX: These records are set up upstream in the `certificates` stack.
      //   dependsOn: [caaRecordRoot, caaRecordWildcard],
    }
  );
  const sslCertValidationRecord = new cloudflare.Record(
    `sslCertValidationRecord`,
    {
      name: sslCert.domainValidationOptions[0].resourceRecordName,
      ttl: 3600,
      type: sslCert.domainValidationOptions[0].resourceRecordType,
      value: sslCert.domainValidationOptions[0].resourceRecordValue,
      zoneId: config.require("cloudflare-zone-id"),
    }
  );
  const sslCertValidation = new aws.acm.CertificateValidation(
    `sslCertValidation`,
    {
      certificateArn: sslCert.arn,
      validationRecordFqdns: [sslCertValidationRecord.name],
    },
    { provider: usEast1 }
  );
  const cdn = createCdn({ domain: DOMAIN, acmCertificateArn: sslCert.arn });

  const frontendDnsRecord = new cloudflare.Record("frontend", {
    name: tldjs.getSubdomain(DOMAIN) || "@",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: cdn.domainName,
    ttl: 1,
    proxied: false, // This was causing infinite HTTPS redirects, so let's just use CloudFront only
  });

  function createCdn({
    domain,
    acmCertificateArn,
  }: {
    domain: string;
    acmCertificateArn: pulumi.Input<string>;
  }) {
    return new aws.cloudfront.Distribution(`${domain}-cdn`, {
      enabled: true,
      // Could include `www.${domain}` here if the `www` subdomain is desired
      aliases: [domain],
      origins: [
        {
          originId: frontendBucket.arn,
          domainName: frontendBucket.bucketRegionalDomainName,
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
          `${domain.replace(/[^a-z0-9_-]/g, "_")}-policy`,
          {
            corsConfig: {
              // XXX: might need to turn this back on because the editor side uses cookies
              //      but when this is true, AllowHeaders can't be `*` so will need to dive deeper
              accessControlAllowCredentials: false,
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
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
        // XXX: CloudFront seems to be returning `403 AccessDenied` when files aren't found. Because the front-end is a Single Page Application (SPA) we need to redirect those errors to `index.html`.
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
      ],
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate: {
        acmCertificateArn,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2021",
      },
      loggingConfig: {
        bucket: logsBucket.bucketDomainName,
        includeCookies: false,
        prefix: `${domain}/`,
      },
    });
  }

  return {
    customDomains,
  };
};

new aws.budgets.Budget("general-budget", {
  budgetType: "COST",
  limitAmount: "400",
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
