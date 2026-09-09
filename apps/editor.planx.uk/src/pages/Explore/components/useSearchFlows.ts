import { gql, useQuery } from "@apollo/client";

export interface FlowsWhere {
  is_template?: { _eq: boolean };
  can_create_from_copy?: { _eq: boolean };
  templated_from?: { _is_null: boolean };
  team?: { slug: { _nin: string[] } };
}

export type FlowFilter = "all" | "templates" | "copyable";

const SEARCH_EXCLUDED_TEAMS = ["testing"];

// Exclude templated flows, showing only source templates and subscriptions within those
const EXCLUDE_TEMPLATED_FLOWS: FlowsWhere = {
  templated_from: { _is_null: true },
  team: { slug: { _nin: SEARCH_EXCLUDED_TEAMS } },
};

const FILTER_WHERE: Record<FlowFilter, FlowsWhere> = {
  all: EXCLUDE_TEMPLATED_FLOWS,
  templates: {
    ...EXCLUDE_TEMPLATED_FLOWS,
    is_template: { _eq: true },
    can_create_from_copy: { _eq: true },
  },
  copyable: {
    ...EXCLUDE_TEMPLATED_FLOWS,
    is_template: { _eq: false },
    can_create_from_copy: { _eq: true },
  },
};

export interface FlowSearchResult {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  status: string;
  isTemplate: boolean;
  canCreateFromCopy: boolean;
  templatedFrom: string | null;
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

// Fields shared by the ranked search_flows query and the unranked browse-all query
const FLOW_SEARCH_RESULT_FIELDS = `
  id
  name
  slug
  summary
  status
  isTemplate: is_template
  canCreateFromCopy: can_create_from_copy
  templatedFrom: templated_from
  team {
    id
    name
    slug
    theme {
      primaryColour: primary_colour
      logo
    }
  }
  publishedFlows: published_flows(order_by: { created_at: desc }, limit: 1) {
    hasSendComponent: has_send_component
  }
  operations(limit: 1, order_by: { created_at: desc }) {
    createdAt: created_at
    actor {
      firstName: first_name
      lastName: last_name
    }
  }
`;

const SEARCH_FLOWS = gql`
  query SearchFlows($search: String!, $where: flows_bool_exp, $limit: Int!) {
    results: search_flows(
      args: { search: $search }
      where: $where
      limit: $limit
    ) {
      ${FLOW_SEARCH_RESULT_FIELDS}
    }
  }
`;

// Powers browsing "Templates" / "Flows I can copy" with no search term entered,
// mirroring the ranked SEARCH_FLOWS shape so callers don't need to branch on result shape
const BROWSE_FLOWS = gql`
  query BrowseFlows($where: flows_bool_exp, $limit: Int!) {
    results: flows(where: $where, order_by: { name: asc }, limit: $limit) {
      ${FLOW_SEARCH_RESULT_FIELDS}
    }
  }
`;

const MIN_SEARCH_LENGTH = 3;

// "All flows" has no browse-all view (too broad) - it only shows results once you search
const BROWSABLE_FILTERS: FlowFilter[] = ["templates", "copyable"];

export const useSearchFlows = (search: string, filter: FlowFilter) => {
  const trimmedSearch = search.trim();
  // search_flows won't return anything for under 3 characters so don't execute
  const isSearching = trimmedSearch.length >= MIN_SEARCH_LENGTH;
  const isPartialSearch = trimmedSearch.length > 0 && !isSearching;
  const canBrowse = BROWSABLE_FILTERS.includes(filter);

  const { data: searchData, loading: searchLoading } = useQuery<{
    results: FlowSearchResult[];
  }>(SEARCH_FLOWS, {
    variables: {
      search: trimmedSearch,
      where: FILTER_WHERE[filter],
      limit: RESULTS_LIMIT,
    },
    skip: !isSearching,
  });

  const { data: browseData, loading: browseLoading } = useQuery<{
    results: FlowSearchResult[];
  }>(BROWSE_FLOWS, {
    variables: { where: FILTER_WHERE[filter], limit: RESULTS_LIMIT },
    skip: isSearching || isPartialSearch || !canBrowse,
  });

  if (isSearching) {
    return {
      results: searchData?.results,
      loading: searchLoading,
      skipped: false,
    };
  }

  if (canBrowse && !isPartialSearch) {
    return {
      results: browseData?.results,
      loading: browseLoading,
      skipped: false,
    };
  }

  return { results: undefined, loading: false, skipped: true };
};
