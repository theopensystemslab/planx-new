import { makeUniqueFlow, getFlowData, insertFlow } from "../../../helpers";
import { userContext } from "../../auth/middleware";

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
    const creatorId = userContext.getStore()?.user?.sub;
    if (!creatorId) throw Error("User details missing from request");

    // Insert the flow and an associated operation
    await insertFlow(
      flow.team_id,
      newSlug,
      uniqueFlowData,
      parseInt(creatorId),
      flowId,
    );
  }

  return { flow, uniqueFlowData };
};

export { copyFlow };
