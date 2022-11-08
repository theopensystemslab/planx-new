import { TYPES } from "@planx/components/types";
import { Store } from "pages/FlowEditor/lib/store";

export function findGeoJSON(
  flow: Store.flow,
  breadcrumbs: Store.breadcrumbs
): GeoJSON | undefined {
  const boundaryQuestionID = Object.keys(breadcrumbs).find(
    (questionId) => flow[questionId]?.type === TYPES.DrawBoundary
  );
  if (boundaryQuestionID) {
    const { data: breadcrumbData } = breadcrumbs[boundaryQuestionID];
    if (breadcrumbData) {
      // scan the breadcrumb's data object (what got saved to passport)
      // and extract the first instance of any geojson that's found
      const geojson = Object.values(breadcrumbData).find(
        (v) => v.type === "Feature"
      );
      return geojson;
    }
  }
}
