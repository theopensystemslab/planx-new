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
import { getPostgresDbUrl } from "../common/utils";
import {
  createApiService,
  createHasuraService,
  createLocalPlanningServices,
  createMetabaseService,
  createSharedbService,
} from "./services"
import {
  createCdn,
  createFlowLinkPreviewLambda,
  usEast1,
} from "./utils";

const config = new pulumi.Config();
const env = pulumi.getStack();
const certificates = new pulumi.StackReference(`planx/certificates/${env}`);
const networking = new pulumi.StackReference(`planx/networking/${env}`);
const data = new pulumi.StackReference(`planx/data/${env}`);

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the Cloudflare API token is missing.
// You can generate tokens here: https://dash.cloudflare.com/profile/api-tokens
new pulumi.Config("cloudflare").requireSecret("apiToken");

const CUSTOM_DOMAINS: CustomDomain[] =
  env === "production"
    ? [
        {
          domain: "planningservices.buckinghamshire.gov.uk",
          name: "buckinghamshire",
          isLegacy: true,
        },
        {
          domain: "planningservices.southwark.gov.uk",
          name: "southwark",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.lambeth.gov.uk",
          name: "lambeth",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.doncaster.gov.uk",
          name: "doncaster",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.medway.gov.uk",
          name: "medway",
          isLegacy: true,
        },
        {
          domain: "planningservices.stalbans.gov.uk",
          name: "stalbans",
          isLegacy: true,
        },
        {
          domain: "planningservices.camden.gov.uk",
          name: "camden",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.barnet.gov.uk",
          name: "barnet",
          isLegacy: true,
        },
        {
          domain: "planningservices.tewkesbury.gov.uk",
          name: "tewkesbury",
          isLegacy: true,
        },
        {
          domain: "planningservices.westberks.gov.uk",
          name: "westberks",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.gateshead.gov.uk",
          name: "gateshead",
          isLegacy: true,
        },
        {
          domain: "planningservices.gloucester.gov.uk",
          name: "gloucester",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.epsom-ewell.gov.uk",
          name: "epsom-and-ewell",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.newcastle.gov.uk",
          name: "newcastle",
          certificateLocation: "pulumiConfig",
          isLegacy: true,
        },
        {
          domain: "planningservices.lbbd.gov.uk",
          name: "barking-and-dagenham",
          isLegacy: true,
        },
        {
          domain: "planningservices.southglos.gov.uk",
          name: "south-gloucestershire",
          isLegacy: true,
        },
        {
          domain: "planningservices.birmingham.gov.uk",
          name: "birmingham",
          isLegacy: true,
        },
        {
          domain: "planningservices.horsham.gov.uk",
          name: "horsham",
          isLegacy: true,
        },
      ]
    : [];

// Domains still served by their own dedicated CloudFront distribution + BYO certificate
const legacyCustomDomains = CUSTOM_DOMAINS.filter(cd => cd.isLegacy == true);
// Domains with DNS validation pending — added to 'mining' cert to surface records to send to council
const pendingCustomDomains = CUSTOM_DOMAINS.filter(cd => !cd.isReady);
// Domains validated and ready to be served by the single shared CloudFront distribution
const validatedCustomDomains = CUSTOM_DOMAINS.filter(cd => !cd.isLegacy && cd.isReady == true);

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

  // ----------------------- SSL cert for services (eu-west-2)
  // NB. the ssl cert created later for CloudFront is in us-east-1, as required by AWS for CF distributions
  // meanwhile our ALBs require a cert in their own region (eu-west-2), which we provision here
  // this enables a secure connection from Cloudflare (via which all requests are proxied) to the origin (AWS)
  const serviceDomains = [
    `api.${DOMAIN}`,
    `hasura.${DOMAIN}`,
    `sharedb.${DOMAIN}`,
    `metabase.${DOMAIN}`,
  ];

  // TODO: consider collapsing certs/validation into 'certificates' layer (see also similar TODO for sslCert below)
  const serviceSslCert = new aws.acm.Certificate(`serviceSslCert`, {
    domainName: serviceDomains[0],
    validationMethod: "DNS",
    subjectAlternativeNames: serviceDomains.slice(1),
  });

  const serviceValidationRecords = serviceDomains.map((_domain, index) => {
    return new cloudflare.DnsRecord(
      `serviceSslCertValidationRecord-${index}`,
      {
        name: serviceSslCert.domainValidationOptions[index].resourceRecordName,
        type: serviceSslCert.domainValidationOptions[index].resourceRecordType,
        content: serviceSslCert.domainValidationOptions[index].resourceRecordValue,
        zoneId: config.requireSecret("cloudflare-zone-id"),
        ttl: 3600,
        proxied: false,
      }
    );
  });

  const serviceSslCertValidation = new aws.acm.CertificateValidation(
    `serviceSslCertValidation`,
    {
      certificateArn: serviceSslCert.arn,
      validationRecordFqdns: serviceValidationRecords.map(record => record.name),
    }
  );

  const serviceCertificateArn = serviceSslCertValidation.certificateArn;

  // prepare DB credentials for Metabase, Hasura and ShareDB
  const DB_ROOT_USER = "dbuser"
  const dbRootPassword = config.requireSecret("db-password");
  const dbHost = config.requireSecret("db-host")

  // ----------------------- Metabase
  const provider = new postgres.Provider("metabase", {
    host: dbHost,
    port: 5432,
    username: DB_ROOT_USER,
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
  const metabaseDbUrl = pulumi
    .all([metabasePgPassword, dbHost])
    .apply(([password, host]) => getPostgresDbUrl({
      role: "metabase",
      password,
      host,
      database: "metabase",
    }));

  const metabaseService = await createMetabaseService({
    env,
    certificateArn: serviceCertificateArn,
    vpcId,
    publicSubnetIds,
    cluster,
    dbUrl: metabaseDbUrl,
    stacks: { certificates },
  });

  // ----------------------- Hasura
  // we'll also pass this database URI to sharedb later on
  const rootDbUrl = pulumi
    .all([dbRootPassword, dbHost])
    .apply(([password, host]) => getPostgresDbUrl({ role: DB_ROOT_USER, password, host }));

  const hasuraService = await createHasuraService({
    env,
    certificateArn: serviceCertificateArn,
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
    certificateArn: serviceCertificateArn,
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
    certificateArn: serviceCertificateArn,
    vpcId,
    publicSubnetIds,
    cluster,
    repo,
    dbUrl: rootDbUrl,
    stacks: { certificates },
  });

  // ----------------------- Flow Link Preview Lambda@Edge
  const flowLinkPreviewLambda = createFlowLinkPreviewLambda(
    `https://hasura.${DOMAIN}/v1/graphql`
  );
  const linkPreviewAssociation = {
    lambdaArn: flowLinkPreviewLambda.qualifiedArn,
    eventType: "viewer-request",
  };

  // ----------------------- PlanX Frontend
  const frontendBucket = new aws.s3.Bucket(DOMAIN, { bucket: DOMAIN });
  const frontendWebsiteConfig = new aws.s3.BucketWebsiteConfiguration(`${DOMAIN}-website-config`, {
    bucket: frontendBucket.id,
    indexDocument: { suffix: "index.html" },
    errorDocument: { key: "error.html" },
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

    // XXX: AWS maintain that most modern use cases don't require ACLs, so we've simplified here
  // see: https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html
  const logsBucket = new aws.s3.Bucket(`${DOMAIN}-logs`, {
    bucket: `${DOMAIN}-logs`,
  });

  // ------------------- (legacy) Custom Domains (per-domain CDN + BYO certificate)
  const customDomains = ((): Array<any> => {
    return legacyCustomDomains.map(createCustomDomain);

    function createCustomDomain({
      domain,
      name,
      certificateLocation = "secretsManager"
    }: CustomDomain) {
      // These certificates are created on the `application` stack (as opposed to the `certificates` stack)
      // They're certificates generated by third-party — we're just importing into AWS ACM
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
        lambdaFunctionAssociation: linkPreviewAssociation,
      });

      return { domain, cname: cdn.domainName };
    }
  })();

  // ------------------- 'mining' certificate (surfaces DNS validation records for pending domains)
  // This cert is NOT attached to any CloudFront distribution. Its sole purpose is to
  // request DNS validation from AWS ACM so we can extract the required CNAME records
  // and send them to council IT teams. Safe to replace on every deploy.
  const miningCert = pendingCustomDomains.length > 0
    ? new aws.acm.Certificate(
        "sslCert-dns-mining",
        {
          domainName: pendingCustomDomains[0].domain,
          subjectAlternativeNames: pendingCustomDomains.slice(1).map(d => d.domain),
          validationMethod: "DNS",
        },
        { provider: usEast1 }
      )
    : undefined;

  // ------------------- single shared custom domain CDN (multi-tenant)
  // A single CloudFront distribution + DNS-validated ACM certificate serving all councils
  // that have completed migration (i.e. where isLegacy is falsy, isReady is true).
  let sharedCdnDomainName: pulumi.Output<string> | undefined;

  if (validatedCustomDomains.length > 0) {
    const sharedCert = new aws.acm.Certificate(
      "sslCert-custom-domains",
      {
        domainName: validatedCustomDomains[0].domain,
        subjectAlternativeNames: validatedCustomDomains.slice(1).map(d => d.domain),
        validationMethod: "DNS",
      },
      { provider: usEast1 }
    );

    const sharedCertValidation = new aws.acm.CertificateValidation(
      "sslCertValidation-custom-domains",
      {
        certificateArn: sharedCert.arn,
      },
      { provider: usEast1 }
    );

    const sharedOai = new aws.cloudfront.OriginAccessIdentity("shared-custom-OAI", {
      comment: "OAI for shared custom domain CloudFront distribution",
    });

    const sharedCdn = createCdn({
      domain: "shared-custom-domains",
      acmCertificateArn: sharedCertValidation.certificateArn,
      bucket: frontendBucket,
      logsBucket,
      oai: sharedOai,
      aliases: validatedCustomDomains.map(d => d.domain),
      lambdaFunctionAssociation: linkPreviewAssociation,
    });

    sharedCdnDomainName = sharedCdn.domainName;
  }

  // domains served by CloudFront distributions (i.e. not already covered by serviceSslCert above)
  const cloudfrontDomains = [
    `${DOMAIN}`,
    ...(env === "staging" ? [`localplanning.${DOMAIN}`] : []),
  ];

  // note the mix of AWS and Cloudflare infra being provisioned here
  // TODO: should this be provisioned in the certs layer, or all consolidated here? should that be run in CI? etc.
  const sslCert = new aws.acm.Certificate(
    `sslCert`,
    {
      domainName: cloudfrontDomains[0],
      validationMethod: "DNS",
      subjectAlternativeNames: cloudfrontDomains.slice(1),
    },
    {
      provider: usEast1,
    }
  );

  const cloudfrontValidationRecords = cloudfrontDomains.map((_domain, index) => {
    return new cloudflare.DnsRecord(
      `sslCertValidationRecord-${index}`,
      {
        name: sslCert.domainValidationOptions[index].resourceRecordName,
        type: sslCert.domainValidationOptions[index].resourceRecordType,
        content: sslCert.domainValidationOptions[index].resourceRecordValue,
        zoneId: config.requireSecret("cloudflare-zone-id"),
        ttl: 3600,
        proxied: false,
      }
    );
  });

  const sslCertValidation = new aws.acm.CertificateValidation(
    `sslCertValidation`,
    {
      certificateArn: sslCert.arn,
      validationRecordFqdns: cloudfrontValidationRecords.map(record => record.name),
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
    lambdaFunctionAssociation: linkPreviewAssociation,
  });

  const frontendDnsRecord = new cloudflare.DnsRecord("frontend", {
    name: tldjs.getSubdomain(DOMAIN) || "@",
    type: "CNAME",
    zoneId: config.requireSecret("cloudflare-zone-id"),
    content: cdn.domainName,
    ttl: 1,
    proxied: false, // This was causing infinite HTTPS redirects, so let's just use CloudFront only
  });

  // ----------------------- LocalPlanning.services
  createLocalPlanningServices(sslCertValidation.certificateArn);

  return {
    customDomains,
    metabaseServiceName: metabaseService.service.name,
    hasuraServiceName: hasuraService.service.name,
    apiServiceName: apiService.service.name,
    sharedbServiceName: sharedbService.service.name,
    // Shared CDN domain name — councils should CNAME their domain to this value
    ...(sharedCdnDomainName && { sharedCdnDomainName }),
    // DNS validation records that councils need to add before we can migrate
    ...(miningCert && {
      pendingCustomerSslTasks: miningCert.domainValidationOptions.apply(
        (options) =>
          options.map((opt) => ({
            domain: opt.domainName,
            validationCname: {
              name: opt.resourceRecordName,
              value: opt.resourceRecordValue,
            },
          }))
      ),
    }),
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
