interface Service {
  name: string;
  slug: string;
  // TODO: Public permission!
  // description
  // slug
  // summary
  description: string | null;
  summary: string | null;
}

interface LPA {
  name: string;
  slug: string;
  services: Service[];
  // TODO: custom subdomains
}

export async function fetchAllLPAs(): Promise<LPA[]> {
  try {
    // TODO: Fetch from correct environment, set up astro env vars
    const response = await fetch("https://hasura.editor.planx.dev/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetLPAs {
            lpas: teams(order_by: { name: asc }) {
              name
              slug
              services: flows(where: {status: { _eq: online }}, order_by: { name: asc }) {
                name
                slug
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
    return lpas;
  } catch (error) {
    console.error("Error fetching LPAs:", error);

    return [];
  }
}
