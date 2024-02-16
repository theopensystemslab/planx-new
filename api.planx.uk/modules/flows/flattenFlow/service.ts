import { dataMerged } from "../../../helpers";

export const getFlattenedFlowData = async (flowId: string, draftDataOnly?: boolean,) => {
  if (draftDataOnly) {
    const unpublishedFlattenedFlowData = await dataMerged(flowId, {}, false, true);
    return unpublishedFlattenedFlowData;
  } else {
    const flattenedFlowData = await dataMerged(flowId);
    return flattenedFlowData;
  }
};
