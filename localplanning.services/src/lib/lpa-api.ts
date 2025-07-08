import { PUBLIC_PLANX_GRAPHQL_API_URL } from "astro:env/client";

export interface Service {
  name: string;
  slug: string;
  description: string | null;
  summary: string | null;
}

interface LPA {
  name: string;
  slug: string;
  theme: {
    logo: string;
    primaryColour: string;
  };
  services: Service[];
  domain: string | null;
}

export async function fetchAllLPAs(): Promise<LPA[]> {
  try {
    const response = await fetch(PUBLIC_PLANX_GRAPHQL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetLPAs {
            lpas: teams(order_by: { name: asc }) {
              name
              slug
              theme {
                logo
                primaryColour: primary_colour
              }
              domain
              services: flows(
                where: {
                  status: { _eq: online }
                }
                order_by: { name: asc }
              ) {
                name
                slug
                summary
                description
              }
            }
          }
        `,
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
    const errorMessage = error instanceof Error 
      ? error.message
      : "Unknown error occurred";

    throw new Error(
      `Error fetching LPAs: ${errorMessage}`
    );
  }
}
