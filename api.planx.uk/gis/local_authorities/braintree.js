require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  addDesignatedVariable,
  squashResultLayers,
  rollupResultLayers,
  getA4Subvariables,
} = require("../helpers.js");
const { planningConstraints, A4_KEY } = require("./metadata/braintree.js");

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
              if (k === "article4") {
                // In addition to the Article 4 variable, also map A4 subvariables onto the accumulator
                const a4Subvariables = getA4Subvariables(data.features, articleFours, A4_KEY);
                acc = { ...acc, ...a4Subvariables };
              }
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
          ...preCheckedLayers,
          ...extras,
        }
      );

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
    const listedLayers = [
      "listed.grade1",
      "listed.grade2",
      "listed.grade2star",
    ];
    const obWithSingleListed = rollupResultLayers(obWithSingleTPO, listedLayers, "listed");

    // Add summary "designated" key to response
    const obWithDesignated = addDesignatedVariable(obWithSingleListed);

    return obWithDesignated;
  } catch (e) {
    throw e;
  }
}

async function locationSearch(x, y, siteBoundary, extras) {
  return go(x, y, siteBoundary, extras);
}

module.exports = {
  locationSearch,
};
