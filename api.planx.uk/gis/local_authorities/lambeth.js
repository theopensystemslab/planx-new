require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  bufferPoint,
  addDesignatedVariable,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/lambeth.js");

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);
const preCheckedLayers = getManualConstraints(planningConstraints);
const articleFours = planningConstraints.article4.records;

// Fetch a data layer
async function search(mapServer, featureName, outFields, geometry, where) {
  const { id } = planningConstraints[featureName];

  let url = makeEsriUrl(mapServer, id, 0, { outFields, geometry, where });

  return fetch(url)
    .then((response) => response.text())
    .then((data) => new Array(featureName, data))
    .catch((error) => {
      console.log("Error:", error);
    });
}

// For this location, iterate through our planning constraints and aggregate/format the responses
async function go(x, y, extras) {
  const point = bufferPoint(x, y, 0.1);

  try {
    const results = await Promise.all(
      Object.keys(gisLayers).map((layer) =>
        search(
          gisLayers[layer].source,
          layer,
          gisLayers[layer].fields,
          point,
          gisLayers[layer].where || "1=1"
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
              if (key === "article4") {
                const properties = data.features.map((f) => f.attributes);
                acc[key] = {
                  ...planningConstraints[key].pos(properties),
                  value: true,
                  type: "warning",
                  data: properties,
                };
                properties.forEach((f) => {
                  const k = articleFours[f.OBJECTID.toString()];
                  acc[k] = {
                    value: true,
                  };
                });
              } else {
                const { attributes: properties } = data.features[0];
                acc[k] = {
                  ...planningConstraints[key].pos(properties),
                  value: true,
                  type: "warning",
                  data: properties,
                };
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
          ...Object.values(articleFours).reduce((acc, curr) => {
            acc[curr] = { value: false };
            return acc;
          }, {}),
          ...preCheckedLayers,
          ...extras,
        }
      );

    ob["designated.conservationArea.lambeth.churchRoad"] = {
      value:
        ob["designated.conservationArea"]?.data?.CA_REF_NO === "CA10"
          ? true
          : false,
    };

    // Since we have multiple article 4 layers, account for granularity & ensure root variable is synced with the subvariables
    // We remove "text" & other keys from subvariables so they don't render a seperate entries in planning constraints list
    if (
      !ob["article4"].value &&
      ob["article4.lambeth.kiba"].value &&
      ob["article4.lambeth.caz"].value
    ) {
      ob["article4"] = ob["article4.lambeth.kiba"]; // doesn't matter which subvariable properties are stored as root for now
      ob["article4.lambeth.kiba"] = { value: true };
      ob["article4.lambeth.caz"] = { value: true };
    } else if (
      !ob["article4"].value &&
      !ob["article4.lambeth.kiba"].value &&
      ob["article4.lambeth.caz"].value
    ) {
      ob["article4"] = ob["article4.lambeth.caz"];
      ob["article4.lambeth.caz"] = { value: true };
      ob["article4.lambeth.kiba"] = { value: false };
    } else if (
      !ob["article4"].value &&
      ob["article4.lambeth.kiba"].value &&
      !ob["article4.lambeth.caz"].value
    ) {
      ob["article4"] = ob["article4.lambeth.kiba"];
      ob["article4.lambeth.kiba"] = { value: true };
      ob["article4.lambeth.caz"] = { value: false };
    } else if (
      !ob["article4.lambeth.kiba"].value &&
      !ob["article4.lambeth.caz"].value
    ) {
      ob["article4.lambeth.kiba"] = { value: false };
      ob["article4.lambeth.caz"] = { value: false };
    }

    // Add summary "designated" key to response
    const obWithDesignated = addDesignatedVariable(ob);

    return obWithDesignated;
  } catch (e) {
    throw e;
  }
}

async function locationSearch(x, y, extras) {
  return go(x, y, extras);
}

module.exports = {
  locationSearch,
};
