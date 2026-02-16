"use strict";

import * as fsWalk from "@nodelib/fs.walk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as postgres from "@pulumi/postgresql";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";
import mime from "mime";

import { CustomDomain } from "../common/teams";
import {
  createApiService,
  createHasuraService,
  createLocalPlanningServices,
  createMetabaseService,
  createSharedbService,
} from "./services"
import {
  createCdn,
  getPostgresDbUrl,
  usEast1,
} from "./utils";

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
    lifecyclePolicy: {
      rules: [
        {
          description: "Keep last 100 images",
          maximumNumberOfImages: 100,
          tagStatus: "any",
        },
      ],
    },
  });

  const vpcId = networking.requireOutput("vpcId") as pulumi.Output<string>;
  const publicSubnetIds = networking.requireOutput("publicSubnetIds") as pulumi.Output<string[]>;
  // define ECS cluster to host all Fargate containers
  const cluster = new aws.ecs.Cluster("cluster", {
    settings: [
      {
        name: "containerInsights",
        value: "enabled",
      },
    ],
  });

  // prepare DB credentials for Metabase, Hasura and ShareDB
  const DB_USER = "dbuser"
  const dbHost = config.requireSecret("db-host")
  const dbRootPassword = config.requireSecret("db-password");

  // ----------------------- Metabase
  const provider = new postgres.Provider("metabase", {
    host: dbHost,
    port: 5432,
    username: DB_USER,
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
  new postgres.Database(
    "metabase",
    {
      name: role.name,
      owner: role.name,
    },
    {
      provider,
    }
  );

  // since our secrets here are of the type Output<string>, we have to use Pulumi methods to access them as strings
  const metabaseDbUrl = pulumi.all([dbHost, metabasePgPassword]).apply(([dbHost, metabasePgPassword]) => 
    getPostgresDbUrl("metabase", metabasePgPassword, dbHost, "metabase"))
  const metabaseService = await createMetabaseService({
    env,
    vpcId,
    publicSubnetIds,
    cluster,
    dbUrl: metabaseDbUrl,
    stacks: { certificates },
  });

  // ----------------------- Hasura
  // we'll also pass this database URI to sharedb later on
  const rootDbUrl = pulumi.all([dbHost, dbRootPassword]).apply(([dbHost, dbRootPassword]) => 
    getPostgresDbUrl(DB_USER, dbRootPassword, dbHost))
  const hasuraService = await createHasuraService({
    env,
    vpcId,
    publicSubnetIds,
    cluster,
    repo,
    dbUrl: rootDbUrl,
    customDomains: CUSTOM_DOMAINS,
    stacks: { certificates },
  });

  // ----------------------- API
  const apiService = await createApiService({
    env,
    vpcId,
    publicSubnetIds,
    cluster,
    repo,
    customDomains: CUSTOM_DOMAINS,
    stacks: { certificates, data },
  });

  // ----------------------- ShareDB
  const sharedbService = await createSharedbService({
    env,
    vpcId,
    publicSubnetIds,
    cluster,
    repo,
    dbUrl: rootDbUrl,
    stacks: { certificates },
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
  const sslCertValidationRecord = new cloudflare.DnsRecord(
    `sslCertValidationRecord`,
    {
      name: sslCert.domainValidationOptions[0].resourceRecordName,
      ttl: 3600,
      type: sslCert.domainValidationOptions[0].resourceRecordType,
      content: sslCert.domainValidationOptions[0].resourceRecordValue,
      zoneId: config.requireSecret("cloudflare-zone-id"),
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

  const frontendDnsRecord = new cloudflare.DnsRecord("frontend", {
    name: tldjs.getSubdomain(DOMAIN) || "@",
    type: "CNAME",
    zoneId: config.requireSecret("cloudflare-zone-id"),
    content: cdn.domainName,
    ttl: 1,
    proxied: false, // This was causing infinite HTTPS redirects, so let's just use CloudFront only
  });

  // ------------------- LocalPlanning.services
  createLocalPlanningServices(sslCert);

  return {
    customDomains,
    metabaseServiceName: metabaseService.service.name,
    hasuraServiceName: hasuraService.service.name,
    apiServiceName: apiService.service.name,
    sharedbServiceName: sharedbService.service.name,
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
