require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  bufferPoint,
  addDesignatedVariable,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/canterbury.js");

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);
const preCheckedLayers = getManualConstraints(planningConstraints);

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
  const geomType =
    siteBoundary.length === 0 ? "esriGeometryEnvelope" : "esriGeometryPolygon";
  const geom =
    geomType === "esriGeometryEnvelope"
      ? bufferPoint(x, y, 0.05)
      : JSON.stringify({
          rings: siteBoundary,
          spatialReference: {
            wkid: 4326,
          },
        });

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

    // Since we have multiple article 4 layers, account for granularity & ensure root variable is synced with the subvariable
    if (ob["article4.canterbury.hmo"].value && !ob["article4"].value) {
      ob["article4"] = ob["article4.canterbury.hmo"];
      // Remove "text" and other keys from subvariable so it doesn't render as separate entry in planning constraints list
      ob["article4.canterbury.hmo"] = { value: true };
    } else if (!ob["article4.canterbury.hmo"].value) {
      // Same as above, make sure we render single a4 planning constraint
      ob["article4.canterbury.hmo"] = { value: false };
    }

    // Merge Listed Buildings & "Locally Listed Buildings" responses under single "listed" variable
    if (ob["listed.local"].value && !ob["listed"].value) {
      ob["listed"] = ob["listed.local"];
      delete ob["listed.local"];
    } else if (!ob["listed.local"].value) {
      delete ob["listed.local"];
    } // If both are true, show each in planning constraints list for MVP debugging; flow schemas only care if passport has "listed"

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
