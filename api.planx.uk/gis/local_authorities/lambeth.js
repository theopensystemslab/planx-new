/*
LAD20CD: E09000022
LAD20NM: Lambeth
LAD20NMW:
FID: 352
*/

var request = require("request");

const articleFours = {
  // : "property.article4.lambeth.fentiman", // CA11
  1: "article4.lambeth.streatham", // CA62
  2: "article4.lambeth.stockwell", // CA05
  3: "article4.lambeth.leigham", // CA31
  4: "property.article4.lambeth.stmarks", // CA11
  5: "article4.lambeth.parkHall", // CA19
  6: "article4.lambeth.lansdowne", // CA03
  7: "article4.lambeth.albert", // CA04
  8: "article4.lambeth.hydeFarm", // CA48
};

const names = {
  CONSERVATION_AREAS: {
    id: "LambethConservationAreas",
    key: "designated.conservationArea",
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
  },
  LISTED_BUILDINGS: {
    id: "LambethListedBuildings",
    key: "listed",
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a ${data.GRADE}`,
      description: data.ADDRESS_1,
    }),
  },
  ARTICLE_4S: {
    id: "LambethArticle4",
    key: "article4",
    neg: "is not subject to any Article 4 directions",
    pos: (data) => {
      const text =
        data.length === 1
          ? "is subject to an Article 4 Restriction"
          : `is subject to multiple Article 4 Restrictions`;
      return {
        text,
        description: data
          .map((d) => d.DESCRIPTION)
          .sort()
          .join(", "),
      };
    },
  },
};

const makeUrl = (id, overrideParams = {}) => {
  let url = `https://gis.lambeth.gov.uk/arcgis/rest/services/${id}/MapServer/0/query`;
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
      search("LISTED_BUILDINGS", ["GRADE", "OBJECTID", "ADDRESS_1"], pt),
      search("CONSERVATION_AREAS", ["NAME", "OBJECTID"], pt),
      search("ARTICLE_4S", ["OBJECTID", "DESCRIPTION"], pt),
    ]);

    const ob = results
      .filter(([key, result]) => !(result instanceof Error))
      .reduce(
        (acc, [key, result]) => {
          const data = JSON.parse(result);
          const k = `${names[key].key}`;

          try {
            if (data.features.length > 0) {
              if (key === "ARTICLE_4S") {
                const properties = data.features.map((f) => f.attributes);
                acc[key] = {
                  ...names[key].pos(properties),
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
                  ...names[key].pos(properties),
                  value: true,
                  type: "warning",
                  data: properties,
                };
              }
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
          "designated.AONB": { value: false },
          "designated.broads": { value: false },
          "defence.explosives": { value: false },
          "designated.nationalPark": { value: false },
          "defence.safeguarded": { value: false },
          "hazard": { value: false },
          "nature.SSSI": { value: false },
          "property.landWCA": { value: false },
          "designated.WHS": { value: false },
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

// go(531593, 174449);
// go(531176, 174642);
// go(529491, 175638);

async function locationSearch(x, y, extras) {
  return go(x, y, extras);
}

module.exports = {
  locationSearch,
};
