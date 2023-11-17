import "isomorphic-fetch";
import {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  squashResultLayers,
  rollupResultLayers,
  addDesignatedVariable,
} from "../helpers.js";
import { planningConstraints, A4_KEY } from "./metadata/braintree.js";

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);
const preCheckedLayers = getManualConstraints(planningConstraints);
const articleFours = planningConstraints.article4.records;

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
    // TODO: Better to have logic here to iterate over listed buildings and TPOs?
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

  const ob = results
    .filter(([_key, result]) => !(result instanceof Error))
    .reduce(
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
        ...preCheckedLayers,
        ...extras,
      },
    );

  // Set granular A4s, accounting for one variable matching to many possible shapes
  if (ob["article4"].value) {
    Object.keys(articleFours).forEach((key) => {
      if (
        articleFours[key].includes(ob["article4"].data[A4_KEY]) ||
        ob[key]?.value
      ) {
        ob[key] = { value: true };
      } else {
        ob[key] = { value: false };
      }
    });
  }

  // Braintree host multiple TPO layers, but we only want to return a single result
  const tpoLayers = [
    "tpo.tenMeterBuffer",
    "tpo.areas",
    "tpo.woodland",
    "tpo.group",
  ];
  const obWithSingleTPO = squashResultLayers(ob, tpoLayers, "tpo");

  // Likewise, multiple layers are provided for "listed"
  // Roll these up to preserve their granularity
  const listedLayers = ["listed.grade1", "listed.grade2", "listed.grade2star"];
  const obWithSingleListed = rollupResultLayers(
    obWithSingleTPO,
    listedLayers,
    "listed",
  );

  // Add summary "designated" key to response
  const obWithDesignated = addDesignatedVariable(obWithSingleListed);

  return obWithDesignated;
}

async function locationSearch(x, y, siteBoundary, extras) {
  return go(x, y, siteBoundary, extras);
}

export { locationSearch };
