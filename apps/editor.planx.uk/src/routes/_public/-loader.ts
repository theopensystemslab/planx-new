import { notFound } from "@tanstack/react-router";
import gql from "graphql-tag";
import { client } from "lib/graphql";

type LoaderArgs = {
  params: {
    /** All _public/ routes will have a $flow param */
    flow: string;
    /** $team param is either present, or can be derived from url.hostname (custom subdomain) */
    team?: string;
  };
};

/**
 * All children of _public using this loader will have a $flowSlug and $teamSlug
 */
export type PublicContext = {
  teamSlug: string;
  flowSlug: string;
};

/**
 * Prevents accessing a different team than the one associated with the custom domain.
 * e.g. Custom domain is for Southwark but URL is looking for Lambeth
 * e.g. https://planningservices.southwark.gov.uk/lambeth/some-flow
 */
export const validateTeamRoute = async (teamParam?: string) => {
  const externalTeamName = await getTeamFromDomain(window.location.hostname);
  if (teamParam && externalTeamName && externalTeamName !== teamParam) {
    throw notFound();
  }

  return externalTeamName;
};

const QUERY_GET_TEAM_BY_DOMAIN = gql`
  query GetTeamByDomain($domain: String!) {
    teams(limit: 1, where: { domain: { _eq: $domain } }) {
      slug
      id
    }
  }
`;

export const getTeamFromDomain = async (
  domain: string,
): Promise<string | undefined> => {
  const {
    data: { teams },
  } = await client.query({
    query: QUERY_GET_TEAM_BY_DOMAIN,
    variables: {
      domain,
    },
    context: { role: "public" },
  });

  return teams?.[0]?.slug;
};

/**
 * Shared loader for all _public routes
 * Ensures we always have a $teamSlug in child routes regardless of access pattern
 *
 * @example Direct access from editor.planx.uk/$team/$flow - $teamSlug derived from route
 * @example Access from custom subdomain (e.g. planningservices.my-council.gov.uk/$flow) - $teamSlug derived from custom subdomain (db query)
 */
export const publicLoader = async ({
  params,
}: LoaderArgs): Promise<PublicContext> => {
  const customSubdomainSlug = await validateTeamRoute(params.team);

  if (customSubdomainSlug) {
    return {
      teamSlug: customSubdomainSlug,
      flowSlug: params.flow,
    };
  }

  // Type-safety only - resolver should not reach here without a $team param
  if (!params.team) throw notFound();

  return {
    teamSlug: params.team,
    flowSlug: params.flow,
  };
};
