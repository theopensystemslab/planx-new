/*
LAD20CD: E07000106
LAD20NM: Canterbury
LAD20NMW:
FID: 285
*/

var request = require("request");

const articleFours = {};

const names = {
  CONSERVATION_AREAS: {
    id: "Open_Data/Conservation_Areas",
    key: "landConservation",
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
  },
  TREE_PRESERVATION_ORDERS: {
    id: "Open_Data/Tree_Preservation_Orders",
    key: "landTPO",
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (_data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
    }),
  },
};

const makeUrl = (id, overrideParams = {}) => {
  let url = `https://mapping.canterbury.gov.uk/arcgis/rest/services/${id}/MapServer/0/query`;

  const defaultParams = {
    where: "1=1",
    geometryType: "esriGeometryEnvelope",
    inSR: 27700,
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: false,
    outSR: 4326,
    f: "json",
    outFields: [],
    geometry: [],
  };

  const params = { ...defaultParams, ...overrideParams };

  if (Array.isArray(params.outFields))
    params.outFields = params.outFields.join(",");
  if (Array.isArray(params.geometry))
    params.geometry = params.geometry.join(",");

  url = [
    url,
    Object.keys(params)
      .map((key) => key + "=" + escape(params[key]))
      .join("&"),
  ].join("?");
  console.log({ url });
  return url;
};

async function search(key, outFields, geometry) {
  const { id } = names[key];

  let url = makeUrl(id, { outFields, geometry });

  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject([key, error]);
      } else if (response.statusCode == 200) {
        resolve([key, body]);
      } else {
        reject([key, Error(response.statusCode)]);
      }
    });
  });
}

async function go(x, y, extras) {
  // const radius = 0.05;
  const radius = 0.05;
  const pt = [x - radius, y + radius, x + radius, y - radius];

  try {
    const results = await Promise.all([
      search("CONSERVATION_AREAS", ["NAME", "OBJECTID"], pt),
      search("TREE_PRESERVATION_ORDERS", ["TPO", "OBJECTID"], pt),
    ]);

    const ob = results
      .filter(([key, result]) => !(result instanceof Error))
      .reduce(
        (acc, [key, result]) => {
          const data = JSON.parse(result);
          const k = `property.${names[key].key}`;

          try {
            if (data.features.length > 0) {
              const { attributes: properties } = data.features[0];
              acc[k] = {
                ...names[key].pos(properties),
                value: true,
                type: "warning",
                data: properties,
              };
            } else {
              if (!acc[k]) {
                acc[k] = {
                  text: names[key].neg,
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
          "property.c31": { value: false },
          "property.landAONB": { value: false },
          "property.landBroads": { value: false },
          "property.landExplosivesStorage": { value: false },
          "property.landNP": { value: false },
          "property.landSafeguarded": { value: false },
          "property.landSafetyHazard": { value: false },
          "property.landSSI": { value: false },
          "property.landWCA": { value: false },
          "property.landWHS": { value: false },
          ...Object.values(articleFours).reduce((acc, curr) => {
            acc[curr] = { value: false };
            return acc;
          }, {}),
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
