require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getFalseConstraints,
  makeEsriUrl,
  bufferPoint,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/lambeth.js");

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);
const falseConstraints = getFalseConstraints(planningConstraints);
const articleFours = planningConstraints.article4.records;

// Fetch a data layer
async function search(mapServer, featureName, outFields, geometry) {
  const { id } = planningConstraints[featureName];

  let url = makeEsriUrl(mapServer, id, 0, { outFields, geometry });

  return fetch(url)
    .then((response) => response.text())
    .then((data) => new Array(featureName, data))
    .catch((error) => {
      console.log("Error:", error);
    });
}

// For this location, iterate through our planning constraints and aggregate/format the responses
async function go(x, y, extras) {
  const point = bufferPoint(x, y, 0.05);

  try {
    const results = await Promise.all(
      gisLayers.map((layer) =>
        search(
          planningConstraints[layer].source,
          layer,
          planningConstraints[layer].fields,
          point
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
          ...falseConstraints,
          ...extras,
        }
      );

    // ob["designated.conservationArea.lambeth.churchRoad"] = {
    //   value:
    //     ob["designated.conservationArea"] &&
    //     ob["designated.conservationArea"].data &&
    //     ob["designated.conservationArea"].data.CA_REF_NO &&
    //     ob["designated.conservationArea"].data.CA_REF_NO === "CA10"
    //       ? true
    //       : false,
    // };

    return ob;
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
