require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  addDesignatedVariable,
  rollupResultLayers,
  squashResultLayers,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/canterbury.js");

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
          ...extras,
          ...preCheckedLayers,
        }
      );

    // Set granular article 4 values
    (Object.keys(articleFours)).forEach((key) => {
      if (ob["article4"]?.data?.REF === articleFours[key]) {
        ob[key] = { value: true }
      } else {
        ob[key] = { value: false }
      }
    });

    // Merge Listed Buildings & "Locally Listed Buildings" responses under single "listed" variable
    const obSquashed = squashResultLayers(ob, ["listed.local"], "listed");

    // Roll up multiple article 4 layers, while preserving granularity for HMO type
    const obRolledUp = rollupResultLayers(obSquashed, ["article4.canterbury.hmo"], "article4");

    // Add summary "designated" key to response
    const obWithDesignated = addDesignatedVariable(obRolledUp);

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
