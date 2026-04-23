import type { CustomDomain } from "./types";

// source of truth for custom domains, provisioned across the certificates and application layers
export const getCustomDomains = (env: string): CustomDomain[] =>
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
          isLegacy: true,
          certificateLocation: "pulumiConfig",
        },
        { 
          domain: "planningservices.lambeth.gov.uk",
          name: "lambeth",
          isLegacy: true,
          certificateLocation: "pulumiConfig",
        },
        { 
          domain: "planningservices.doncaster.gov.uk",
          name: "doncaster",
          isLegacy: true,
          certificateLocation: "pulumiConfig",
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
          isLegacy: true,
          certificateLocation: "pulumiConfig",
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
          isLegacy: true,
          certificateLocation: "pulumiConfig",
        },
        { 
          domain: "planningservices.gateshead.gov.uk",
          name: "gateshead",
          isLegacy: true,
        },
        { 
          domain: "planningservices.gloucester.gov.uk",
          name: "gloucester",
          isLegacy: true,
          certificateLocation: "pulumiConfig",
        },
        { 
          domain: "planningservices.epsom-ewell.gov.uk",
          name: "epsom-and-ewell",
          isLegacy: true,
          certificateLocation: "pulumiConfig",
        },
        { 
          domain: "planningservices.newcastle.gov.uk",
          name: "newcastle",
          isLegacy: true,
          certificateLocation: "pulumiConfig",
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
        { 
          domain: "planningservices.canterbury.gov.uk",
          name: "canterbury"
        },
      ]
    : [
        // we maintain a 'custom domain' on staging for testing (on a domain we control but which is not PlanX)
        { 
          domain: "planningservices.fairhold.org",
          name: "fairhold",
          isLegacy: true,
          // isReady: false,
        },
    ];
