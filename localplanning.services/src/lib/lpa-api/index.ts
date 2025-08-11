import { PUBLIC_PLANX_GRAPHQL_API_URL } from "astro:env/client";
import { GET_LPAS_QUERY } from "@lib/lpa-api/query";
import { print } from "graphql";

export interface Service {
  name: string;
  slug: string;
  description: string | null;
  summary: string | null;
}

export interface LPA {
  name: string;
  slug: string;
  theme: {
    logo: string;
    primaryColour: string;
  };
  applyServices: Service[];
  guidanceServices: Service[];
  notifyServices: Service[];
  domain: string | null;
}

const TEAMS_ALLOW_LIST = [
  "barking-and-dagenham",
  "barnet",
  "birmingham",
  "braintree",
  "bromley",
  "buckinghamshire",
  "camden",
  "canterbury",
  "doncaster",
  "epsom-and-ewell",
  "gateshead",
  "gloucester",
  "horsham",
  "kingston",
  "lambeth",
  "medway",
  "newcastle",
  "south-gloucestershire",
  "southwark",
  "st-albans",
  "tewkesbury",
  "west-berkshire",
] as const;

const APPLICATION_SERVICE_SLUGS = [
  "apply-for-planning-permission",
  "camden-apply-for-planning-permission",
  "apply-for-planning-permission-to-make-changes-to-a-flat",
  "apply-for-a-lawful-development-certificate",
  "camden-apply-for-a-lawful-development-certificate",
  "apply-for-prior-approval",
  "apply-for-listed-building-consent",
  "apply-for-pre-application-advice",
  "apply-for-building-regulations-applications",
  "apply-for-building-regulations-notice",
  "apply-for-regularisation",
];

const NOTIFY_SERVICE_SLUGS = [
  "report-a-planning-breach",
  "camden-report-a-planning-breach",
  "report-a-derelict-or-empty-building",
  "report-a-potential-dangerous-structure",
  "let-the-planning-team-know-about-an-issue",
];

const GUIDANCE_SERVICE_SLUGS = [
  "find-out-if-you-need-planning-permission",
  "check-if-you-need-planning-permission",
  "check-your-planning-constraints",
  "check-constraints-on-a-property",
];

export async function fetchAllLPAs(): Promise<LPA[]> {
  try {
    const response = await fetch(PUBLIC_PLANX_GRAPHQL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_LPAS_QUERY),
        variables: {
          teamSlugs: TEAMS_ALLOW_LIST,
          notifyServiceSlugs: NOTIFY_SERVICE_SLUGS,
          applicationServiceSlugs: APPLICATION_SERVICE_SLUGS,
          guidanceServiceSlugs: GUIDANCE_SERVICE_SLUGS,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GraphQL query failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const allLPAs: LPA[] = json.data.lpas;

    if (!allLPAs || !allLPAs.length) {
      throw Error("No LPAs found - please check GraphQL API and database.");
    }

    // Remove LPAs with no active services
    const lpas = allLPAs.filter(
      (lpa) =>
        lpa.applyServices.length ||
        lpa.guidanceServices.length ||
        lpa.notifyServices.length
    );

    if (!allLPAs || !allLPAs.length) {
      throw Error(
        "No LPAs with services found - please check GraphQL API and database."
      );
    }

    return lpas;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    throw new Error(`Error fetching LPAs: ${errorMessage}`);
  }
}
