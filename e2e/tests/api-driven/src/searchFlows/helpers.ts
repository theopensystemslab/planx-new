import { gql } from "graphql-tag";

import { $admin } from "../client.js";
import { createTeam, createUser } from "../globalHelpers.js";

export const setup = async () => {
  const teamId = await createTeam();
  const userId = await createUser();

  return { teamId, userId };
};

export const cleanup = async () => {
  await $admin.flow._destroyAll();
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};

let flowCounter = 0;

interface CreateSearchableFlowArgs {
  teamId: number;
  name: string;
  summary?: string;
  description?: string;
  isTemplate?: boolean;
  deleted?: boolean;
}

interface InsertFlow {
  flow: { id: string };
}

export const createSearchableFlow = async ({
  teamId,
  name,
  summary,
  description,
  isTemplate,
  deleted,
}: CreateSearchableFlowArgs) => {
  const slug = `e2e-search-flows-${Date.now()}-${flowCounter++}`;

  const { flow } = await $admin.client.request<InsertFlow>(
    gql`
      mutation CreateSearchableFlow(
        $slug: String!
        $name: String!
        $teamId: Int!
        $summary: String
        $description: String
        $isTemplate: Boolean!
        $deletedAt: timestamptz
      ) {
        flow: insert_flows_one(
          object: {
            slug: $slug
            name: $name
            team_id: $teamId
            data: {}
            summary: $summary
            description: $description
            is_template: $isTemplate
            deleted_at: $deletedAt
          }
        ) {
          id
        }
      }
    `,
    {
      slug,
      name,
      teamId,
      summary: summary ?? null,
      description: description ?? null,
      isTemplate: isTemplate ?? false,
      deletedAt: deleted ? new Date().toISOString() : null,
    },
  );

  return flow.id;
};

export interface SearchFlowResult {
  id: string;
  name: string;
}

interface SearchFlows {
  searchFlows: SearchFlowResult[];
}

export const searchFlows = async (
  search: string,
  where: Record<string, unknown>,
) => {
  const { searchFlows } = await $admin.client.request<SearchFlows>(
    gql`
      query SearchFlows($search: String!, $where: flows_bool_exp!) {
        searchFlows: search_flows(args: { search: $search }, where: $where) {
          id
          name
        }
      }
    `,
    { search, where },
  );

  return searchFlows;
};
