import { PUBLIC_PLANX_BUILD_TIME_GRAPHQL_API_URL } from "astro:env/client";
import { GET_LPAS_QUERY } from "@lib/lpa-api/query";
import { print } from "graphql";

export interface Service {
  name: string;
  slug: string;
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

export async function fetchAllLPAs(): Promise<LPA[]> {
  try {
    const response = await fetch(PUBLIC_PLANX_BUILD_TIME_GRAPHQL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_LPAS_QUERY),
        variables: {
          teamSlugs: TEAMS_ALLOW_LIST,
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

    const lpas: LPA[] = json.data.lpas;

    if (!lpas || !lpas.length) {
      throw Error("No LPAs found - please check GraphQL API and database.");
    }

    return lpas;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    throw new Error(`Error fetching LPAs: ${errorMessage}`);
  }
}
