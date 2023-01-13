import { findGeoJSON } from "./helpers";

describe("findGeoJSON", () => {
  it("finds the first GeoJSON object when only one exists", () => {
    const geojson = {
      type: "Feature",
      properties: null,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.07626448954420499, 51.48571252157308],
            [-0.0762916416717913, 51.48561932090584],
            [-0.07614058275089933, 51.485617225458554],
            [-0.07611118911905082, 51.4857099488319],
            [-0.07626448954420499, 51.48571252157308],
          ],
        ],
      },
    };
    const passport = {
      data: {
        "property.boundary.site": {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.07626448954420499, 51.48571252157308],
                [-0.0762916416717913, 51.48561932090584],
                [-0.07614058275089933, 51.485617225458554],
                [-0.07611118911905082, 51.4857099488319],
                [-0.07626448954420499, 51.48571252157308],
              ],
            ],
          },
          properties: null,
        },
      },
    };
    const found = findGeoJSON(passport);
    expect(found).toEqual(geojson);
  });

  it("returns undefined when no GeoJSON-like objects exist", () => {
    const passport = { data: {} };
    const found = findGeoJSON(passport);
    expect(found).toEqual(undefined);
  });
});
