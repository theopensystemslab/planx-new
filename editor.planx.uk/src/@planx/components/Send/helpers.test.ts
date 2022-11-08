import { TYPES } from "@planx/components/types";
import { Store } from "pages/FlowEditor/lib/store";

import { findGeoJSON } from "./helpers";

describe("findGeoJSON", () => {
  it("finds the first GeoJSON object when only one exists", () => {
    const geojson: GeoJSON = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07643975531307334, 51.485847769536015],
            [-0.0764006164494183, 51.4855918619739],
            [-0.07587615567891393, 51.48561867140494],
            [-0.0759899845402056, 51.48584045791162],
            [-0.07643975531307334, 51.485847769536015],
          ],
        ],
      },
    };
    const breadcrumbs: Store.breadcrumbs = {
      A1: {
        data: { "property.boundary.site": geojson },
      },
    };
    const flow: Store.flow = {
      A1: {
        id: "A1",
        type: TYPES.DrawBoundary,
      },
    };
    const found = findGeoJSON(flow, breadcrumbs);
    expect(found).toEqual(geojson);
  });

  it("finds the first GeoJSON object when multiple exist", () => {
    const geojson: GeoJSON = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07643975531307334, 51.485847769536015],
            [-0.0764006164494183, 51.4855918619739],
            [-0.07587615567891393, 51.48561867140494],
            [-0.0759899845402056, 51.48584045791162],
            [-0.07643975531307334, 51.485847769536015],
          ],
        ],
      },
    };
    const breadcrumbs: Store.breadcrumbs = {
      A1: {
        data: {
          "property.boundary.site": geojson,
          "property.boundary.location": geojson,
        },
      },
    };
    const flow: Store.flow = {
      A1: {
        id: "A1",
        type: TYPES.DrawBoundary,
      },
    };
    const found = findGeoJSON(flow, breadcrumbs);
    expect(found).toEqual(geojson);
  });

  it("returns undefined when no GeoJSON-like objects exist", () => {
    const breadcrumbs: Store.breadcrumbs = {
      A1: {
        data: {
          "property.boundary.site": {},
        },
      },
    };
    const flow: Store.flow = {
      A1: {
        id: "A1",
        type: TYPES.DrawBoundary,
      },
    };
    const found = findGeoJSON(flow, breadcrumbs);
    expect(found).toEqual(undefined);
  });
});
