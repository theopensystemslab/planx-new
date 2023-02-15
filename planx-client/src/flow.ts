import { gql } from "graphql-request";
import type { GraphQLClient } from "graphql-request";

export async function createFlow(
  client: GraphQLClient,
  args: { teamId: number; slug: string; data?: object }
): Promise<string> {
  const { insert_flows_one: response } = await client.request(
    gql`
      mutation CreateFlow($teamId: Int!, $flowSlug: String!, $data: jsonb) {
        insert_flows_one(object: { team_id: $teamId, slug: $flowSlug, data: $data, version: 1 }) {
          id
        }
      }
    `,
    {
      teamId: args.teamId,
      flowSlug: args.slug,
      data: args.data,
    }
  );
  await createAssociatedOperation(client, { flowId: response.id });
  return response.id;
}

export async function publishFlow(
  client: GraphQLClient,
  args: { flow: { id: string; data: object }; publisherId: number }
): Promise<number> {
  const { insert_published_flows_one: response } = await client.request(
    gql`
      mutation InsertPublishedFlow(
        $publishedFlow: published_flows_insert_input!,
      ) {
        insert_published_flows_one(
          object: $publishedFlow
        ) {
          id
        }
      }
    `,
    {
      publishedFlow: {
        flow_id: args.flow.id,
        data: args.flow.data,
        publisher_id: args.publisherId,
      },
    }
  );

  return response.id;
}

// Add a row to `operations` for an inserted flow, otherwise ShareDB throws a silent error when opening the flow in the UI
async function createAssociatedOperation(
  client: GraphQLClient,
  args: { flowId: string }
): Promise<number> {
  const { insert_operations_one: response } = await client.request(
    gql`
    mutation InsertOperation ($flowId: uuid!, $data: jsonb = {}) {
      insert_operations_one(object: { flow_id: $flowId, version: 1, data: $data }) {
        id
      }
    }
    `,
    { flowId: args.flowId }
  );
  return response.id;
}
