"use strict";

import * as fsWalk from "@nodelib/fs.walk";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as postgres from "@pulumi/postgresql";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";
import mime from "mime";

import { getCustomDomains } from "../common/customDomains";
import type { CustomDomain } from "../common/types";
import {
  getLegacyDomains,
  getPostgresDbUrl,
  getValidatedDomains,
} from "../common/utils";

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

const CUSTOM_DOMAINS = getCustomDomains(env);
const legacyCustomDomains = getLegacyDomains(CUSTOM_DOMAINS);
const validatedCustomDomains = getValidatedDomains(CUSTOM_DOMAINS);

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
  const createLegacyDistributions = ({
    domain,
    name,
    certificateLocation = "secretsManager"
  }: CustomDomain) => {
    // These certificates are created on the `application` stack (as opposed to the `certificates` stack)
    // They're generated by third-party (i.e. councils) — we're just storing them and importing into AWS ACM
    let acmCertificateArn: pulumi.Output<string>;

    // Get certificates from AWS Secrets Manager
    if (certificateLocation === "secretsManager") {
      const secretId = `ssl/${name}`;
      const certSecret = pulumi.output(aws.secretsmanager.getSecretVersion({ secretId }));
      const certData = certSecret.apply(secretResult =>
        JSON.parse(secretResult.secretString)
      );
      const sslCert = new aws.acm.Certificate(
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

      acmCertificateArn = sslCert.arn;

    } else {
      // Get certificates from Pulumi config file
      const sslCert = new aws.acm.Certificate(
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

      acmCertificateArn = sslCert.arn;
    }

    const oai = new aws.cloudfront.OriginAccessIdentity(`${domain}-OAI`, {
      comment: `OAI for ${domain} CloudFront distribution`,
    });

    const cdn = createCdn({
      cdnName: domain,
      domains: [domain],
      acmCertificateArn,
      bucket: frontendBucket, 
      logsBucket,
      oai,
      lambdaFunctionAssociation: linkPreviewAssociation,
    });

    return { domain, cname: cdn.domainName };
  }

  const legacyDistributions = legacyCustomDomains.map(createLegacyDistributions);

  // ------------------- Single shared custom domain CDN (multi-tenant)
  // Here we only create the CloudFront distribution, consuming the validated cert ARN
  let customDomainsCdnDomainName: pulumi.Output<string> | undefined;

  const customDomainsCertificateArn = certificates.getOutput("customDomainsCertificateArn") as pulumi.Output<string | undefined>;

  if (validatedCustomDomains.length > 0) {
    const customDomainsOai = new aws.cloudfront.OriginAccessIdentity("custom-domains-OAI", {
      comment: "OAI for shared custom domain CloudFront distribution",
    });

    const customDomainsCdn = createCdn({
      cdnName: "custom-domains",
      domains: validatedCustomDomains.map(d => d.domain),
      acmCertificateArn: customDomainsCertificateArn.apply(arn => {
        if (!arn) throw new Error("customDomainsCertificateArn not found in certificates stack — run `pulumi up` on the certificates stack first");
        return arn;
      }),
      bucket: frontendBucket,
      logsBucket,
      oai: customDomainsOai,
      lambdaFunctionAssociation: linkPreviewAssociation,
    });

    customDomainsCdnDomainName = customDomainsCdn.domainName;
  }

  // domains served by CloudFront distributions (i.e. not already covered by serviceSslCert above)
  const cloudfrontDomains = [
    `${DOMAIN}`,
    ...(env === "staging" ? [`localplanning.${DOMAIN}`] : []),
  ];

  // note the mix of AWS and Cloudflare infra being provisioned here
  // TODO: should this be provisioned in the certs layer, or all consolidated here? should that be run in CI? etc.
  const editorSslCert = new aws.acm.Certificate(
    `sslCert-editor`,
    {
      domainName: cloudfrontDomains[0],
      validationMethod: "DNS",
      subjectAlternativeNames: cloudfrontDomains.slice(1),
    },
    {
      provider: usEast1,
    }
  );

  // here we control the nameserver, so handle the DNS validation ourselves
  const cloudfrontValidationRecords = cloudfrontDomains.map((_domain, index) => {
    return new cloudflare.DnsRecord(
      `sslCertValidationRecord-editor-${index}`,
      {
        name: editorSslCert.domainValidationOptions[index].resourceRecordName,
        type: editorSslCert.domainValidationOptions[index].resourceRecordType,
        content: editorSslCert.domainValidationOptions[index].resourceRecordValue,
        zoneId: config.requireSecret("cloudflare-zone-id"),
        ttl: 3600,
        proxied: false,
      }
    );
  });

  const sslCertValidation = new aws.acm.CertificateValidation(
    `sslCertValidation-editor`,
    {
      certificateArn: editorSslCert.arn,
      validationRecordFqdns: cloudfrontValidationRecords.map(record => record.name),
    },
    { provider: usEast1 }
  );

  // TODO: migrate to Origin Access Control (instead of Identity)
  // see: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
  const oai = new aws.cloudfront.OriginAccessIdentity(`${DOMAIN}-OAI`, {
    comment: `OAI for ${DOMAIN} CloudFront distribution`,
  });

  const cdn = createCdn({
    cdnName: DOMAIN,
    domains: [DOMAIN],
    acmCertificateArn: editorSslCert.arn,
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
    legacyDistributions,
    cdnDistributionId: cdn.id,
    metabaseServiceName: metabaseService.service.name,
    hasuraServiceName: hasuraService.service.name,
    apiServiceName: apiService.service.name,
    sharedbServiceName: sharedbService.service.name,
    // shared CDN domain name — councils should CNAME their domain to this value
    ...(customDomainsCdnDomainName && { customDomainsCdnDomainName }),
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
