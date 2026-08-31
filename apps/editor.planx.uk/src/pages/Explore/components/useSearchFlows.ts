import { gql, useQuery } from "@apollo/client";

export interface FlowsWhere {
  is_template?: { _eq: boolean };
  can_create_from_copy?: { _eq: boolean };
}

export interface FlowSearchResult {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  status: string;
  is_template: boolean;
  can_create_from_copy: boolean;
  templated_from: string | null;
  team: {
    id: number;
    name: string;
    slug: string;
    theme: {
      primaryColour: string | null;
      logo: string | null;
    };
  };
  publishedFlows: { hasSendComponent: boolean }[];
  operations: {
    createdAt: string;
    actor?: { firstName: string; lastName: string };
  }[];
}

const RESULTS_LIMIT = 50;

const SEARCH_FLOWS = gql`
  query SearchFlows($search: String!, $where: flows_bool_exp, $limit: Int!) {
    results: search_flows(
      args: { search: $search }
      where: $where
      limit: $limit
    ) {
      id
      name
      slug
      summary
      status
      is_template
      can_create_from_copy
      templated_from
      team {
        id
        name
        slug
        theme {
          primaryColour: primary_colour
          logo
        }
      }
      publishedFlows: published_flows(
        order_by: { created_at: desc }
        limit: 1
      ) {
        hasSendComponent: has_send_component
      }
      operations(limit: 1, order_by: { created_at: desc }) {
        createdAt: created_at
        actor {
          firstName: first_name
          lastName: last_name
        }
      }
    }
  }
`;

const MIN_SEARCH_LENGTH = 3;

export const useSearchFlows = (search: string, where?: FlowsWhere) => {
  // search_flows won't return anything for under 3 characters so don't execute
  const skip = search.trim().length < MIN_SEARCH_LENGTH;

  const { data, loading } = useQuery<{ results: FlowSearchResult[] }>(
    SEARCH_FLOWS,
    {
      variables: { search, where, limit: RESULTS_LIMIT },
      skip,
    },
  );

  return { results: data?.results, loading, skipped: skip };
};
