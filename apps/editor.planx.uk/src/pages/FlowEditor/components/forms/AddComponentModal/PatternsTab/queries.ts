import { gql } from "@apollo/client";
import type { Graph } from "@planx/graph";

export const GET_PATTERNS = gql`
  query GetPatterns {
    patterns: flows(
      where: {
        is_pattern: { _eq: true }
        archived_at: { _is_null: true }
        can_create_from_copy: { _eq: true }
      }
      order_by: { name: asc }
    ) {
      id
      name
      slug
      summary
    }
  }
`;

export interface Pattern {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
}

export type GetPatternsQuery = {
  patterns: Pattern[];
};

export const GET_PATTERN_DATA = gql`
  query GetPatternData($id: uuid!) {
    pattern: flows_by_pk(id: $id) {
      id
      data
    }
  }
`;

export type GetPatternDataQuery = {
  pattern: {
    id: string;
    data: Graph;
  } | null;
};

export type GetPatternDataVars = {
  id: string;
};
