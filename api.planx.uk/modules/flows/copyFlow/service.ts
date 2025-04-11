import { makeUniqueFlow, getFlowData, createFlow } from "../../../helpers.js";
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
    // Insert the flow and an associated operation
    await createFlow(teamId, slug, name, uniqueFlowData, flowId);
  }

  return { flow, uniqueFlowData };
};

export { copyFlow };
