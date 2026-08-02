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
      data
    }
  }
`;

export interface Pattern {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  data: Graph;
}

export type GetPatternsQuery = {
  patterns: Pattern[];
};
