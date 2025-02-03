import { makeUniqueFlow, getFlowData, createFlow } from "../../../helpers.js";

const copyFlow = async (
  flowId: string,
  replaceValue: string,
  insert: boolean,
) => {
  // Fetch the original flow
  const flow = await getFlowData(flowId);

  // Generate new flow data which is an exact "content" copy of the original but with unique nodeIds
  const uniqueFlowData = makeUniqueFlow(flow.data, replaceValue);

  // Check if copied flow data should be inserted into `flows` table, or just returned for reference
  if (insert) {
    const newSlug = flow.slug + "-copy";
    const newName = flow.name + " (copy)";

    // Insert the flow and an associated operation
    await createFlow(flow.team_id, newSlug, newName, uniqueFlowData, flowId);
  }

  return { flow, uniqueFlowData };
};

export { copyFlow };
