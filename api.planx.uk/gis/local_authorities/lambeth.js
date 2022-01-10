require("isomorphic-fetch");

const {
  getQueryableConstraints,
  getManualConstraints,
  makeEsriUrl,
  setEsriGeometryType,
  setEsriGeometry,
  addDesignatedVariable,
  rollupResultLayers,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/lambeth.js");

// Process local authority metadata
const gisLayers = getQueryableConstraints(planningConstraints);
const preCheckedLayers = getManualConstraints(planningConstraints);
const articleFours = planningConstraints.article4.records;

// Fetch a data layer
async function search(
  mapServer,
  featureName,
  outFields,
  geometry,
  geometryType,
  where
) {
  const { id } = planningConstraints[featureName];

  let url = makeEsriUrl(mapServer, id, 0, {
    outFields,
    geometry,
    geometryType,
    where,
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
  const geom = setEsriGeometry(geomType, x, y, 2.5, siteBoundary);

  try {
    const results = await Promise.all(
      Object.keys(gisLayers).map((layer) =>
        search(
          gisLayers[layer].source,
          layer,
          gisLayers[layer].fields,
          geom,
          geomType,
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

    // Set granular article 4 values
    (Object.keys(articleFours)).forEach((key) => {
      if (ob["designated.conservationArea"]?.data?.CA_REF_NO === articleFours[key]) {
        ob[key] = { value: true };
        ob["article4"] = {
          text: "is subject to an Article 4 direction(s)",
          description: ob["designated.conservationArea"].data.CA_REF_NO,
          value: true,
          type: "warning",
          data: ob["designated.conservationArea"].data
        }
      } else {
        ob[key] = { value: false };
      }
    });

    // Roll up multiple Article4 layers
    const obRolledUp = rollupResultLayers(ob, ["article4", "article4.lambeth.caz", "article4.lambeth.kiba"], "article4");

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
