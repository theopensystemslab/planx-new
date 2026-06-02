import type { CustomDomain } from "./types";

// source of truth for custom domains, provisioned across the certificates and application layers
export const getCustomDomains = (env: string): CustomDomain[] =>
  env === "production"
    ? [
        {
          name: "buckinghamshire",
          domain: "planningservices.buckinghamshire.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "southwark",
          domain: "planningservices.southwark.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "lambeth",
          domain: "planningservices.lambeth.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "doncaster",
          domain: "planningservices.doncaster.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "medway",
          domain: "planningservices.medway.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "stalbans",
          domain: "planningservices.stalbans.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "camden",
          domain: "planningservices.camden.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "barnet",
          domain: "planningservices.barnet.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "tewkesbury",
          domain: "planningservices.tewkesbury.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "westberks",
          domain: "planningservices.westberks.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "gateshead",
          domain: "planningservices.gateshead.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "gloucester",
          domain: "planningservices.gloucester.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "epsom-and-ewell",
          domain: "planningservices.epsom-ewell.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "newcastle",
          domain: "planningservices.newcastle.gov.uk",
          cloudFrontState: "legacy-with-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "barking-and-dagenham",
          domain: "planningservices.lbbd.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "south-gloucestershire",
          domain: "planningservices.southglos.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "birmingham",
          domain: "planningservices.birmingham.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "horsham",
          domain: "planningservices.horsham.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "canterbury",
          domain: "planningservices.canterbury.gov.uk",
          cloudFrontState: "legacy-with-validation",
        },
        {
          name: "northumberland",
          domain: "planningservices.northumberland.gov.uk",
          cloudFrontState: "validation-only",
        },
        {
          name: "coventry",
          domain: "planningservices.coventry.gov.uk",
          cloudFrontState: "validation-only",
        }
      ]
    : [
        // we keep one custom domain on staging to function as a canary (monitored by UptimeRobot)
        {
          name: "test-new",
          domain: "planningservices.planx.in",
          cloudFrontState: "shared-final",
        },
    ];

// get domains for which we maintain a dedicated per-domain CloudFront distribution + imported cert
export const getLegacyDomains = (customDomains: CustomDomain[]) =>
  customDomains.filter(cd => ["legacy-with-validation", "cutover-ongoing"].includes(cd.cloudFrontState));

// get domains to be added to 'mining' cert (which surfaces DNS validation records to send to council)
export const getPendingDomains = (customDomains: CustomDomain[]) =>
  customDomains.filter(cd => ["validation-only", "legacy-with-validation"].includes(cd.cloudFrontState));

// get domains ready for DNS validation, for which we maintain a shared CDN + in-house cert
export const getValidatedDomains = (customDomains: CustomDomain[]) =>
  customDomains.filter(cd => ["cutover-ongoing", "shared-final"].includes(cd.cloudFrontState));
