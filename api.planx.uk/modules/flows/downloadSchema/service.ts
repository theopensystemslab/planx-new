import { $public } from "../../../client";
import { gql } from "graphql-request";

interface FlowSchema {
  node: string;
  type: string;
  text: string;
  planx_variable: string;
}

export const getFlowSchema = async (flowId: string) => {
  const { flowSchema } = await $public.client.request<{
    flowSchema: FlowSchema[];
  }>(
    gql`
      query ($flow_id: String!) {
        flowSchema: get_flow_schema(args: { published_flow_id: $flow_id }) {
          node
          type
          text
          planx_variable
        }
      }
    `,
    { flow_id: flowId },
  );

  if (!flowSchema.length) {
    throw Error(
      "Can't find a schema for this flow. Make sure it's published or try a different flow id.",
    );
  }

  return flowSchema;
};
