require("isomorphic-fetch");

const { makeEsriUrl } = require("../helpers.js");
const {
  mapServerDomain,
  planningConstraints,
} = require("./metadata/canterbury.js");

// only query planningConstraints with known GIS data sources
let gisLayers = [];
Object.keys(planningConstraints).map((layer) => {
  if ("id" in planningConstraints[layer]) {
    gisLayers.push(layer);
  }
});

async function search(key, serverIndex, outFields, geometry) {
  const { id } = planningConstraints[key];

  let url = makeEsriUrl(mapServerDomain, id, serverIndex, {
    outFields,
    geometry,
  });

  return fetch(url)
    .then((response) => response.text())
    .then((data) => new Array(key, data))
    .catch((error) => {
      console.log("Error:", error);
    });
}

async function go(x, y, extras) {
  // since no property boundaries, create a buffer around the address point
  const radius = 0.05;
  const pt = [x - radius, y + radius, x + radius, y - radius];

  try {
    const results = await Promise.all(
      gisLayers.map((layer) =>
        search(
          layer,
          planningConstraints[layer].serverIndex,
          planningConstraints[layer].fields,
          pt
        )
      )
    );

    const ob = results
      .filter(([key, result]) => !(result instanceof Error))
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
          } catch (e) {}

          return acc;
        },
        {
          "designated.AONB": { value: false },
          "designated.broads": { value: false },
          "defence.explosives": { value: false },
          "designated.nationalPark": { value: false },
          "defence.safeguarded": { value: false },
          hazard: { value: false },
          "nature.SSSI": { value: false },
          ...extras,
        }
      );

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
