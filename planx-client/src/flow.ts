import { Request } from "./graphql";

export async function createFlow(
  request: Request,
  args: { teamId: number; slug: string; data?: object }
): Promise<string> {
  const { insert_flows_one: response } = await request(
    `
      mutation CreateFlow($teamId: Int!, $flowSlug: String!, $data: jsonb) {
        insert_flows_one(object: { team_id: $teamId, slug: $flowSlug, data: $data }) {
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
  return response.id;
}

export async function publishFlow(
  request: Request,
  args: { flow: { id: string; data: object }; publisherId: number }
): Promise<number> {
  const { insert_published_flows_one: response } = await request(
    `
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
