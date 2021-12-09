require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  addDesignatedVariable,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/braintree.js");

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);
const preCheckedLayers = getManualConstraints(planningConstraints);
const articleFours = {}; // "planningConstraints.article4.records" in future

// Fetch a data layer
async function search(
  mapServer,
  featureName,
  serverIndex,
  outFields,
  geometry,
  geometryType
) {
  const { id } = planningConstraints[featureName];

  let url = makeEsriUrl(mapServer, id, serverIndex, {
    outFields,
    geometry,
    geometryType,
  });

  return fetch(url)
    .then((response) => response.text())
    .then((data) => new Array(featureName, data))
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

  try {
    const results = await Promise.all(
      // TODO: Better to have logic here to iterate over listed buildings and TPOs?
      Object.keys(gisLayers).map((layer) =>
        search(
          gisLayers[layer].source,
          layer,
          gisLayers[layer].serverIndex,
          gisLayers[layer].fields,
          geom,
          geomType
        )
      )
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
              };
            } else {
              if (!acc[k]) {
                acc[k] = {
                  text: planningConstraints[key].neg,
                  value: false,
                  type: "check",
                  data: {},
                };
              }
            }
          } catch (e) {
            console.log(e);
          }

          return acc;
        },
        {
          ...Object.values(articleFours).reduce((acc, curr) => {
            acc[curr] = { value: false };
            return acc;
          }, {}),
          ...preCheckedLayers,
          ...extras,
        }
      );

    // Braintree host multiple TPO layers, but we only want to return a single result
    squashTPOLayers(ob);

    // Add summary "designated" key to response
    const obWithDesignated = addDesignatedVariable(ob);

    return obWithDesignated;
  } catch (e) {
    throw e;
  }
}

const squashTPOLayers = (ob) => {
  const tpoLayers = [
    "tpo.tenMeterBuffer",
    "tpo.areas",
    "tpo.woodland",
    "tpo.group",
  ];
  // Check to see if we have any intersections
  const match = tpoLayers.find((layer) => layer.value);
  // If we do, return this as the result. Otherwise take the first (negative) value.
  ob.tpo = match ? match : ob[tpoLayers[0]];
  // Tidy up the redundant layers
  tpoLayers.forEach((layer) => delete ob[layer]);
}

async function locationSearch(x, y, siteBoundary, extras) {
  return go(x, y, siteBoundary, extras);
}

module.exports = {
  locationSearch,
};
