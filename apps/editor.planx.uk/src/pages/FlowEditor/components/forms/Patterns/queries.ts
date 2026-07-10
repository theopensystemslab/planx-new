import { gql } from "@apollo/client";
import type { Graph } from "@planx/graph";

export interface PatternFlow {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  data: Graph | null;
}

export interface GetPatternsData {
  flows: PatternFlow[];
}

export const GET_PATTERNS = gql`
  query GetPatterns {
    flows(
      where: {
        team: { slug: { _eq: "patterns" } }
        archived_at: { _is_null: true }
      }
      order_by: { name: asc }
    ) {
      id
      slug
      name
      summary
      data
    }
  }
`;
