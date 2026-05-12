import type { CustomDomain } from "./types";

// source of truth for custom domains, provisioned across the certificates and application layers
export const getCustomDomains = (env: string): CustomDomain[] =>
  env === "production"
    ? [
        {
          name: "buckinghamshire",
          domain: "planningservices.buckinghamshire.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "southwark",
          domain: "planningservices.southwark.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "lambeth",
          domain: "planningservices.lambeth.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "doncaster",
          domain: "planningservices.doncaster.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "medway",
          domain: "planningservices.medway.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "stalbans",
          domain: "planningservices.stalbans.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "camden",
          domain: "planningservices.camden.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "barnet",
          domain: "planningservices.barnet.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "tewkesbury",
          domain: "planningservices.tewkesbury.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "westberks",
          domain: "planningservices.westberks.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "gateshead",
          domain: "planningservices.gateshead.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "gloucester",
          domain: "planningservices.gloucester.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "epsom-and-ewell",
          domain: "planningservices.epsom-ewell.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "newcastle",
          domain: "planningservices.newcastle.gov.uk",
          cloudFrontState: "single-plus-validation",
          certificateLocation: "pulumiConfig",
        },
        {
          name: "barking-and-dagenham",
          domain: "planningservices.lbbd.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "south-gloucestershire",
          domain: "planningservices.southglos.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "birmingham",
          domain: "planningservices.birmingham.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "horsham",
          domain: "planningservices.horsham.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
        {
          name: "canterbury",
          domain: "planningservices.canterbury.gov.uk",
          cloudFrontState: "single-plus-validation",
        },
      ]
    : [
        // we spin up 'custom domains' on staging for testing purposes
        {
          name: "test-legacy",
          domain: "planningserviceslegacy.planx.in",
          cloudFrontState: "single-plus-shared",
        },
        {
          name: "test-new",
          domain: "planningservices.planx.in",
          cloudFrontState: "shared-only",
        },
    ];
