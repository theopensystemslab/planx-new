import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createCdn = ({
  domain,
  acmCertificateArn,
  bucket,
  logsBucket,
}: {
  domain: string;
  acmCertificateArn?: pulumi.Input<string>;
  bucket: aws.s3.Bucket;
  logsBucket: aws.s3.Bucket;
}) => {
  // Generate Origin Access Identity to access the private s3 bucket.
  const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(
    `${domain.replace(/[^a-z0-9_-]/g, "_")}-originAccessIdentity`,
    {
      comment: "This is needed to setup s3 polices and make s3 not public.",
    }
  );

  const cdn = new aws.cloudfront.Distribution(`${domain}-cdn`, {
    enabled: true,
    // Could include `www.${domain}` here if the `www` subdomain is desired
    aliases: [domain],
    origins: [
      {
        originId: bucket.arn,
        domainName: bucket.bucketRegionalDomainName,
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
            // Set X-Content-Type-Options = "nosniff"
            contentTypeOptions: {
              override: true,
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
      ...(acmCertificateArn 
        ? { acmCertificateArn } 
        : { cloudfrontDefaultCertificate: true }
      ),
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },
    loggingConfig: {
      bucket: logsBucket.bucketDomainName,
      includeCookies: false,
      prefix: `${domain}/`,
    },
  });

  return cdn;
};
