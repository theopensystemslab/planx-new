import { Request } from "./graphql";

export async function createFlow(
  request: Request,
  args: { teamId: number; slug: string }
) {
  const { insert_flows_one: response } = await request(
    `
      mutation CreateFlow($teamId: Int!, $flowSlug: String!) {
        insert_flows_one(object: { team_id: $teamId, slug: $flowSlug }) {
          id
        }
      }
    `,
    {
      teamId: args.teamId,
      flowSlug: args.slug,
    }
  );
  return response;
}

export async function publishFlow(request: Request, args: { flowId: string }) {
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
      publishedFlow: { flow_id: args.flowId },
    }
  );

  return response;
}
