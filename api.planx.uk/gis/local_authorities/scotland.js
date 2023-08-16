import "isomorphic-fetch";
import https from "https";
import {
  getQueryableConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  rollupResultLayers,
  addDesignatedVariable,
} from "../helpers.js";
import { planningConstraints } from "./metadata/scotland";

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);

// Fetch a data layer
async function search(
  mapServer,
  featureName,
  serverIndex,
  outFields,
  geometry,
  geometryType,
) {
  const { id } = planningConstraints[featureName];

  let url = makeEsriUrl(mapServer, id, serverIndex, {
    outFields,
    geometry,
    geometryType,
  });

  return fetch(url)
    .then((response) => response.text())
    .then((data) => [featureName, data])
    .catch((error) => {
      console.log("Error:", error);
    });
}

// For this location, iterate through our planning constraints and aggregate/format the responses
async function go(x, y, siteBoundary, extras) {
  // If we have a siteBoundary from drawing,
  //   then query using the polygon, else fallback to the buffered address point
  const geomType = setEsriGeometryType(siteBoundary);
  const geom = setEsriGeometry(geomType, x, y, 0.05, siteBoundary);

  const results = await Promise.all(
    Object.keys(gisLayers).map((layer) =>
      search(
        gisLayers[layer].source,
        layer,
        gisLayers[layer].serverIndex,
        gisLayers[layer].fields,
        geom,
        geomType,
      ),
    ),
  );

  const ob = results.filter(Boolean).reduce(
    (acc, [key, result]) => {
      const data = JSON.parse(result);
      const k = `${planningConstraints[key].key}`;

      try {
        if (data.features.length > 0) {
          const { attributes: properties } = data.features[0];
          acc[k] = {
            ...planningConstraints[key].pos(properties),
            value: true,
            type: "warning",
            data: properties,
            category: planningConstraints[key].category,
          };
        } else {
          if (!acc[k]) {
            acc[k] = {
              text: planningConstraints[key].neg,
              value: false,
              type: "check",
              data: {},
              category: planningConstraints[key].category,
            };
          }
        }
      } catch (e) {
        console.log(e);
      }

      return acc;
    },
    {
      ...extras,
    },
  );

  // Scotland hosts multiple national park layers
  // Roll these up to preserve their granularity when true
  const nationalParkLayers = [
    // "designated.nationalPark.cairngorms",
    // "designated.nationalPark.lochLomondTrossachs",
  ];
  const obWithOneNationalPark = rollupResultLayers(
    ob,
    nationalParkLayers,
    "designated.nationalPark",
  );

  // Add summary "designated" key to response
  const obWithDesignated = addDesignatedVariable(obWithOneNationalPark);

  return obWithDesignated;
}

async function locationSearch(x, y, siteBoundary, extras) {
  return go(x, y, siteBoundary, extras);
}

export { locationSearch };
