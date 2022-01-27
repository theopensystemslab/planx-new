require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  addDesignatedVariable,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/buckinghamshire.js");

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
              // account for multiple, overlapping features in a single source
              const properties = [];
              data.features.forEach(feature => properties.push(feature.attributes));

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
                  data: [],
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

    // Loop through article4 features and set granular planx values
    if (ob["article4"].data.length > 0) {
      ob["article4"].data.forEach((d) => {
        (Object.keys(articleFours)).forEach((key) => {
          // Account for line breaks/newlines in DEV_TYPE formatting
          if (d.DEV_TYPE.replace(/\r?\n|\r/g, " ") === articleFours[key] || ob[key]?.value) {
            ob[key] = { value: true }
          } else if (d.INT_ID === articleFours[key] || ob[key]?.value) {
            ob[key] = { value: true }
          } else if (d.DESCRIPTIO.startsWith(articleFours[key]) || ob[key]?.value) {
            ob[key] = { value: true }
          } else {
            ob[key] = { value: false }
          }
        });
      });
    }

    // Add summary "designated" key to response
    const obWithDesignated = addDesignatedVariable(ob);

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
