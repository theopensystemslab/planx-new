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

const EXCLUDED_TEAM_SLUGS = [
  "open-digital-planning",
  "opensystemslab",
  "planx",
  "templates",
  "testing",
  "wikihouse",
] as const;

const NOTIFY_SERVICE_SLUGS = [
  "report-a-planning-breach",
  "camden-report-a-planning-breach",
];

export async function fetchAllLPAs(): Promise<LPA[]> {
  try {
    const response = await fetch(PUBLIC_PLANX_GRAPHQL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_LPAS_QUERY),
        variables: {
          excludedTeamSlugs: EXCLUDED_TEAM_SLUGS,
          notifyServiceSlugs: NOTIFY_SERVICE_SLUGS,
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
