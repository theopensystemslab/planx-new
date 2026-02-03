"use strict";

import * as fsWalk from "@nodelib/fs.walk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as postgres from "@pulumi/postgresql";
import * as mime from "mime";
import * as tldjs from "tldjs";

import {
  addRedirectToCloudFlareListenerRule,
  createCdn,
  DEFAULT_POSTGRES_PORT,
  generateCORSAllowList,
  generateTeamSecrets,
  getJavaOpts,
  getPostgresDbUrl,
  usEast1,
} from "./utils";
import { createHasuraService } from "./services/hasura";
import { createLocalPlanningServices } from "./services/lps";
import { CustomDomain } from "../common/teams";

const config = new pulumi.Config();

const env = pulumi.getStack();
const certificates = new pulumi.StackReference(`planx/certificates/${env}`);
const networking = new pulumi.StackReference(`planx/networking/${env}`);
const data = new pulumi.StackReference(`planx/data/${env}`);

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the CloudFlare API token is missing.
// You can generate tokens here: https://dash.cloudflare.com/profile/api-tokens
new pulumi.Config("cloudflare").requireSecret("apiToken");

const CUSTOM_DOMAINS: CustomDomain[] =
  env === "production"
    ? [
        {
          domain: "planningservices.buckinghamshire.gov.uk",
          name: "buckinghamshire",
        },
        {
          domain: "planningservices.southwark.gov.uk",
          name: "southwark",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.lambeth.gov.uk",
          name: "lambeth",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.doncaster.gov.uk",
          name: "doncaster",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.medway.gov.uk",
          name: "medway",
        },
        {
          domain: "planningservices.stalbans.gov.uk",
          name: "stalbans",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.camden.gov.uk",
          name: "camden",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.barnet.gov.uk",
          name: "barnet",
        },
        {
          domain: "planningservices.tewkesbury.gov.uk",
          name: "tewkesbury",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.westberks.gov.uk",
          name: "westberks",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.gateshead.gov.uk",
          name: "gateshead"
        },
        {
          domain: "planningservices.gloucester.gov.uk",
          name: "gloucester",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.epsom-ewell.gov.uk",
          name: "epsom-and-ewell",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.newcastle.gov.uk",
          name: "newcastle",
          certificateLocation: "pulumiConfig",
        },
        {
          domain: "planningservices.lbbd.gov.uk",
          name: "barking-and-dagenham",
        },
        {
          domain: "planningservices.southglos.gov.uk",
          name: "south-gloucestershire",
        },
        {
          domain: "planningservices.birmingham.gov.uk",
          name: "birmingham",
        },
        {
          domain: "planningservices.horsham.gov.uk",
          name: "horsham",
        },
      ]
    : [];

export = async () => {
  const DOMAIN: string = await certificates.requireOutputValue("domain");

  const repo = new awsx.ecr.Repository("repo", {
    lifeCyclePolicyArgs: {
      rules: [
        {
          description: "Keep last 100 images",
          maximumNumberOfImages: 100,
          selection: "any",
        },
      ],
    },
  });

  const vpc = awsx.ec2.Vpc.fromExistingIds("vpc", {
    vpcId: networking.requireOutput("vpcId"),
  });
  const cluster = new awsx.ecs.Cluster("cluster", {
    cluster: networking.requireOutput("clusterName"),
    vpc,
  });

  const DB_ROOT_USERNAME = "dbuser";
  const dbHost = config.requireSecret("db-host")
  const dbRootPassword = config.requireSecret("db-password");
  // ----------------------- Metabase
  const provider = new postgres.Provider("metabase", {
    host: dbHost,
    port: 5432,
    username: DB_ROOT_USERNAME,
    password: dbRootPassword,
    database: "postgres",
    superuser: false,
  });
  const metabasePgPassword = config.requireSecret("metabasePgPassword");

  // Setup role and database for internal Metabase application data, such as dashboards and queries
  // This is separate to the postgres/public one used to hold PlanX application data
  // Docs: https://www.metabase.com/docs/latest/installation-and-operation/configuring-application-database
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
  
  // since our secrets here are of the type Output<string>, we have to use Pulumi methods to access them as strings
  const metabaseDbUrl = pulumi.all([dbHost, metabasePgPassword]).apply(([dbHost, metabasePgPassword]) => 
    getPostgresDbUrl("metabase", metabasePgPassword, dbHost, DEFAULT_POSTGRES_PORT, "metabase"))
  const metabaseMemoryMb = config.requireNumber("metabase-memory");
  new awsx.ecs.FargateService("metabase", {
    cluster,
    subnets: networking.requireOutput("publicSubnetIds"),
    taskDefinitionArgs: {
      logGroup: new aws.cloudwatch.LogGroup("metabase", {
        namePrefix: "metabase",
        retentionInDays: 30,
      }),
      container: {
        // if changing, also check docker-compose.yml
        image: "metabase/metabase:v0.56.6",
        portMappings: [metabaseListenerHttp],
        // When changing `memory`, also update `JAVA_OPTS` below
        cpu: config.requireNumber("metabase-cpu"),
        memory: metabaseMemoryMb,
        environment: [
          // https://www.metabase.com/docs/latest/troubleshooting-guide/running.html#allocating-more-memory-to-the-jvm
          { name: "JAVA_OPTS", value: getJavaOpts(metabaseMemoryMb) },
          { name: "MB_DB_TYPE", value: "postgres" },
          {
            name: "MB_DB_CONNECTION_URI",
            value: metabaseDbUrl,
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
  // we'll also pass this database URI to sharedb later on

  const rootDbUrl = pulumi.all([dbHost, dbRootPassword]).apply(([dbHost, dbRootPassword]) => 
    getPostgresDbUrl(DB_ROOT_USERNAME, dbRootPassword, dbHost))
  const hasuraService = await createHasuraService({
    env,
    vpc,
    cluster,
    repo,
    dbUrl: rootDbUrl,
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
          context: "../../apps/api.planx.uk",
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
          {
            name: "AI_GATEWAY_API_KEY",
            value: config.requireSecret("ai-gateway-api-key"),
          },
          {
            name: "FILE_API_KEY",
            value: config.requireSecret("file-api-key"),
          },
          {
            name: "FILE_API_KEY_NEXUS",
            value: config.requireSecret("file-api-key-nexus"),
          },
          {
            name: "FILE_API_KEY_BARNET",
            value: config.requireSecret("file-api-key-barnet"),
          },
          {
            name: "FILE_API_KEY_LAMBETH",
            value: config.requireSecret("file-api-key-lambeth"),
          },
          {
            name: "FILE_API_KEY_SOUTHWARK",
            value: config.requireSecret("file-api-key-southwark"),
          },
          {
            name: "FILE_API_KEY_EPSOM_EWELL",
            value: config.requireSecret("file-api-key-epsom-ewell"),
          },
          {
            name: "FILE_API_KEY_MEDWAY",
            value: config.requireSecret("file-api-key-medway"),
          },
          {
            name: "FILE_API_KEY_GATESHEAD",
            value: config.requireSecret("file-api-key-gateshead"),
          },
          {
            name: "FILE_API_KEY_DONCASTER",
            value: config.requireSecret("file-api-key-doncaster"),
          },
          {
            name: "FILE_API_KEY_GLOUCESTER",
            value: config.requireSecret("file-api-key-gloucester"),
          },
          {
            name: "FILE_API_KEY_TEWKESBURY",
            value: config.requireSecret("file-api-key-tewkesbury"),
          },
          {
            name: "FILE_API_KEY_CAMDEN",
            value: config.requireSecret("file-api-key-camden"),
          },
          {
            name: "SKIP_RATE_LIMIT_SECRET",
            value: config.requireSecret("skip-rate-limit-secret"),
          },
          {
            name: "GOOGLE_CLIENT_ID",
            value: config.require("google-client-id"),
          },
          {
            name: "GOOGLE_CLIENT_SECRET",
            value: config.requireSecret("google-client-secret"),
          },
          {
            name: "MICROSOFT_CLIENT_ID",
            value: config.require("microsoft-client-id"),
          },
          {
            name: "MICROSOFT_CLIENT_SECRET",
            value: config.requireSecret("microsoft-client-secret"),
          },
          {
            name: "SESSION_SECRET",
            value: config.requireSecret("session-secret"),
          },
          { name: "API_URL_EXT", value: `https://api.${DOMAIN}` },
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
          {
            name: "ENCRYPTION_KEY",
            value: config.requireSecret("encryption-key"),
          },
          {
            name: "IDOX_NEXUS_CLIENT",
            value: config.requireSecret("idox-nexus-client"),
          },
          {
            name: "IDOX_NEXUS_TOKEN_URL",
            value: config.requireSecret("idox-nexus-token-url"),
          },
          {
            name: "IDOX_NEXUS_SUBMISSION_URL",
            value: config.requireSecret("idox-nexus-submission-url"),
          },
          {
            name: "MAPBOX_ACCESS_TOKEN",
            value: config.requireSecret("mapbox-access-token"),
          },
          {
            name: "METABASE_API_KEY",
            value: config.requireSecret("metabase-api-key"),
          },
          {
            name: "METABASE_URL_EXT",
            value: `https://metabase.${DOMAIN}`,
          },
          {
            name: "LPS_URL_EXT",
            value: pulumi.interpolate`https://${config.require("lps-domain")}`,
          },
          generateCORSAllowList(CUSTOM_DOMAINS, DOMAIN),
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
        image: repo.buildAndPushImage("../../apps/sharedb.planx.uk"),
        memory: 512 /*MB*/,
        portMappings: [sharedbListenerHttp],
        environment: [
          { name: "PORT", value: String(SHAREDB_PORT) },
          { name: "API_URL_EXT", value: `https://api.${DOMAIN}` },
          {
            name: "PG_URL",
            value: rootDbUrl,
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

  // ------------------- PlanX Frontend
  const frontendBucket = new aws.s3.Bucket(`${DOMAIN}`, {
    bucket: DOMAIN,
    website: {
      indexDocument: "index.html",
      errorDocument: "error.html",
    },
  });

  fsWalk
    .walkSync("../../apps/editor.planx.uk/build/", {
      basePath: "",
      entryFilter: (e) => !e.dirent.isDirectory(),
    })
    .forEach(({ path }) => {
      const relativeFilePath = `../../apps/editor.planx.uk/build/${path}`;
      const contentType = mime.getType(relativeFilePath) || "";
      const contentFile = new aws.s3.BucketObject(
        path,
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
          // Temp transition alias
          aliases: [{ name: `../../editor.planx.uk/build/${path}` }]
        }
      );
    });

  const logsBucket = new aws.s3.Bucket("requestLogs", {
    bucket: `${DOMAIN}-logs`,
    acl: "private",
  });

  const customDomains = ((): Array<any> => {
    return CUSTOM_DOMAINS.map(createCustomDomain);

    function createCustomDomain({
      domain,
      name,
      certificateLocation = "secretsManager"
    }: CustomDomain) {
      // These certificates are created on the `application` stack (as opposed to the `certificates` stack) they're certificates generated by third-party. We're just importing into AWS ACM.
      let acmCertificateArn: pulumi.Output<string>;

      // Get certificates from AWS Secrets Manager
      if (certificateLocation === "secretsManager") {
        const secretId = `ssl/${name}`;
        const certSecret = pulumi.output(aws.secretsmanager.getSecretVersion({ secretId }));
        const certData = certSecret.apply(secretResult =>
          JSON.parse(secretResult.secretString)
        );
        const certificate = new aws.acm.Certificate(
          `sslCert-${name}`,
          {
            privateKey: certData.apply(data => data.key),
            certificateBody: certData.apply(data => data.cert),
            certificateChain: certData.apply(data => data?.chain),
          },
          { 
            provider: usEast1,
            replaceOnChanges: ["privateKey"],
          }
        );

        acmCertificateArn = certificate.arn;

      } else {
        // Get certificates from Pulumi config file
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
            replaceOnChanges: ["privateKey"],
          }
        );

        acmCertificateArn = certificate.arn;
      }

      const oai = new aws.cloudfront.OriginAccessIdentity(`${domain}-OAI`, {
        comment: `OAI for ${domain} CloudFront distribution`,
      });

      const cdn = createCdn({ 
        domain, 
        acmCertificateArn,
        bucket: frontendBucket, 
        logsBucket,
        oai,
      });

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

  const oai = new aws.cloudfront.OriginAccessIdentity(`${DOMAIN}-OAI`, {
    comment: `OAI for ${DOMAIN} CloudFront distribution`,
  });

  const cdn = createCdn({
    domain: DOMAIN,
    acmCertificateArn: sslCert.arn,
    bucket: frontendBucket,
    logsBucket,
    oai,
  });

  const frontendDnsRecord = new cloudflare.Record("frontend", {
    name: tldjs.getSubdomain(DOMAIN) || "@",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: cdn.domainName,
    ttl: 1,
    proxied: false, // This was causing infinite HTTPS redirects, so let's just use CloudFront only
  });

  // ------------------- LocalPlanning.services
  createLocalPlanningServices(sslCert);

  return {
    customDomains,
    hasuraServiceName: hasuraService.service.name,
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
