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

  const nodes = Object.keys(flow.data).filter((key) => key !== "_root");

  // TODO: What about multiple results in the same node?

  nodes.forEach((node) => {
    const data = flow.data[node]["data"];
    if (!data) return;
    
    Object.entries(data).map(([ _key, value ]) => {
      if (value === searchTerm) {
      results.push({
        nodeId: flow.data[node].id!,
        nodeType: flow.data[node].type!,
        nodeTitle: flow.data[node].data?.title,
        text: "todo",
        // text: "..." + "preceding X characters " + searchTerm + " following X characters" + "...",
        path: ["this", "is" "todo!"],
      })
      }
    });
  });

  return results;
};