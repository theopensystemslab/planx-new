import { getFlowData } from "../../../helpers";
import { SearchResult } from "./controller";

interface SearchFlowDataArgs {
  flowId: string, 
  searchTerm: string, 
  facet: "data",
} 

export const searchFlowData = async ({
  flowId,
  searchTerm,
  facet,
}: SearchFlowDataArgs): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];

  const flow = await getFlowData(flowId);
  const nodeIds = Object.keys(flow.data).filter((key) => key !== "_root");

  // TODO: What about multiple results in the same node?

  nodeIds.forEach((nodeId) => {
    const data = flow.data[nodeId]["data"];
    if (!data) return;
    
    Object.entries(data).map(([ _key, value ]) => {
      const node = flow.data[nodeId];
      if (value === searchTerm) {
        results.push({
          nodeId,
          nodeType: node.type!,
          nodeTitle: flow.data[nodeId].data?.title,
          text: "todo",
          // text: "..." + "preceding X characters " + searchTerm + " following X characters" + "...",
          path: ["this", "is", "todo!"],
        });
      }
    });
  });

  return results;
};