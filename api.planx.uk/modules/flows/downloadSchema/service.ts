import { getFlowData } from "../../../helpers";

interface FlowSchema {
  node: string;
  type: string;
  text: string;
  planx_variable: string;
}

export const getFlowSchema = async (flowId: string) => {
  const flow = await getFlowData(flowId);

  const data: FlowSchema[] = [];
  Object.entries(flow.data).map(([nodeId, nodeData]) =>
    data.push({
      node: nodeId,
      type: nodeData?.type?.toString() || "_root",
      text: nodeData.data?.text,
      planx_variable:
        nodeData.data?.fn ||
        nodeData.data?.val ||
        nodeData.data?.output ||
        nodeData.data?.dataFieldBoundary,
    }),
  );

  return data;
};
