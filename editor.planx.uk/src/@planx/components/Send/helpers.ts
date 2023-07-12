import { TYPES } from "@planx/components/types";
import { Store } from "pages/FlowEditor/lib/store";

export function findGeoJSON(
  flow: Store.flow,
  breadcrumbs: Store.breadcrumbs,
): { type: "Feature" } | undefined {
  const foundNodeId = Object.keys(breadcrumbs).find(
    (nodeId) => flow[nodeId]?.type === TYPES.DrawBoundary,
  );
  if (!foundNodeId) return;
  const { data: boundaryData } = breadcrumbs[foundNodeId];
  if (boundaryData) {
    // scan the breadcrumb's data object (what got saved to passport)
    // and extract the first instance of any geojson that's found
    const geojson = Object.values(boundaryData).find(
      (v) => v.type === "Feature",
    );
    return geojson;
  }
}
