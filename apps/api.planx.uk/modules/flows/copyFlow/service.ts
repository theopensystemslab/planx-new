import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { getFlowData, makeUniqueFlow } from "../../../helpers.js";
import type { Flow } from "../../../types.js";
import { userContext } from "../../auth/middleware.js";
import { publishFlow } from "../publish/service.js";
import type { CopyFlowRequest } from "./controller.js";

const copyFlow = async ({
  flowId,
  slug,
  name,
  teamId,
  replaceValue,
  insert,
}: CopyFlowRequest) => {
  // Fetch the original flow
  const flow = await getFlowData(flowId);

  // Generate new flow data which is an exact "content" copy of the original but with unique nodeIds
  const uniqueFlowData = makeUniqueFlow(flow.data, replaceValue);

  // Check if copied flow data should be inserted into `flows` table, or just returned for reference
  if (insert) {
    const userId = userContext.getStore()?.user?.sub;
    if (!userId) throw new Error("User details missing from request");

    // Insert the flow, its associated operation, and a copy of the source flow's notes all in a single Postgres transaction -
    // see the `copy_flow` psql function
    const { copyFlow: insertedFlow } = await $api.client.request<{
      copyFlow: { id: Flow["id"] };
    }>(
      gql`
        mutation CopyFlow($args: copy_flow_args!) {
          copyFlow: copy_flow(args: $args) {
            id
          }
        }
      `,
      {
        args: {
          source_flow_id: flowId,
          team_id: teamId,
          slug,
          name,
          flow_data: uniqueFlowData,
          is_service: flow.isService,
          is_pattern: flow.isPattern,
          replace_value: replaceValue,
          creator_id: Number(userId),
        },
      },
    );

    // Publish immediately, same as createFlow() does for every newly-created flow
    await publishFlow(insertedFlow.id, "Created flow from copy");
  }

  return { flow, uniqueFlowData };
};

export { copyFlow };
