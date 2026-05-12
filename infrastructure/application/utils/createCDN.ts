import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const spaErrorResponses: aws.cloudfront.DistributionArgs["customErrorResponses"] = [
  {
    errorCode: 404,
    responseCode: 200,
    responsePagePath: "/index.html",
  },
  {
    errorCode: 403,
    responseCode: 200,
    responsePagePath: "/index.html",
  },
];

const staticErrorResponses: aws.cloudfront.DistributionArgs["customErrorResponses"] = [
  {
    errorCode: 404,
    responseCode: 404,
    responsePagePath: "/404",
  },
  {
    errorCode: 403,
    responseCode: 404,
    responsePagePath: "/404",
  },
];

// TODO: should we just be using a pre-baked AWS policy to simplify this?
// e.g. CORS-with-preflight-and-SecurityHeadersPolicy
// see: https://github.com/theopensystemslab/planx-new/pull/6491#issue-4281272671
const responseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy(
  "shared-cdn-headers-policy",
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
      // Set X-Content-Type-Options = "nosniff"
      contentTypeOptions: {
        override: true,
      },
    },
  }
);

export const createCdn = ({
  cdnName,
  domains,
  acmCertificateArn,
  bucket,
  logsBucket,
  oai,
  mode = "spa",
  includeWww = false,
  lambdaFunctionAssociation,
}: {
  cdnName: string;
  domains: string[];
  acmCertificateArn: pulumi.Input<string>;
  bucket: aws.s3.Bucket;
  logsBucket: aws.s3.Bucket;
  oai: aws.cloudfront.OriginAccessIdentity,
  mode?: "static" | "spa"
  includeWww?: boolean;
  lambdaFunctionAssociation?: {
    lambdaArn: pulumi.Input<string>;
    eventType: string;
    includeBody?: boolean;
  };
}) => {
  let aliases = domains;
  if (includeWww) {
    aliases = domains.reduce((acc, domain) => {
      acc.push(`www.${domain}`, domain);
      return acc;
    }, [] as string[]);
  }

  const cdn = new aws.cloudfront.Distribution(`${cdnName}-cdn`, {
    enabled: true,
    aliases,
    origins: [
      {
        originId: bucket.arn,
        domainName: bucket.bucketRegionalDomainName,
        s3OriginConfig: {
          originAccessIdentity: oai.cloudfrontAccessIdentityPath,
        },
      },
    ],
    defaultRootObject: mode === "spa" ? "index.html" : "index",

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
      targetOriginId: bucket.arn,
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
      lambdaFunctionAssociations: lambdaFunctionAssociation
        ? [lambdaFunctionAssociation]
        : [],
      responseHeadersPolicyId: responseHeadersPolicy.id
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad, and also the least expensive.
    priceClass: "PriceClass_100",
    customErrorResponses:
      mode === "spa" ? spaErrorResponses : staticErrorResponses,
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
      prefix: `${cdnName}/`,
    },
  });

  return cdn;
};
