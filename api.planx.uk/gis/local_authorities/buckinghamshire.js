/*
LAD20CD: E06000060
LAD20NM: Buckinghamshire
LAD20NMW:
FID: 135
*/

const request = require("request");
const { makeUrlFromObject } = require("../helpers.js");

const articleFours = {};

const names = {
  CONSERVATION_AREAS: {
    id: "LP19ConsvArea",
    key: "landConservation",
    neg: "is not in a Conservation Area",
    pos: "is in a Conservation Area",
  },
  LISTED_BUILDINGS: {
    id: "ListedBuilding",
    key: "buildingListed",
    neg: "is not in, or within, a Listed Building",
    pos: `is, or is within, a Listed Building`,
  },
  ARTICLE_4S: {
    id: "Article4Direction",
    key: "article4s",
    neg: "is not subject to any Article 4 directions",
    pos: "is subject to Article 4 Restriction(s)",
  },
  TREE_PRESERVATION_ORDERS: {
    id: "TreePreservationOrder",
    key: "landTPO",
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: "is in a TPO (Tree Preservation Order) zone",
  },
};

const bbox = (x, y, r = 0.0001) => `${x - r},${y - r},${x + r},${y + r}`;

async function search(key, bbox) {
  const { id } = names[key];

  const url = makeUrlFromObject({
    root: "https://inspire.wycombe.gov.uk/getows.ashx",
    params: {
      service: "WFS",
      request: "GetFeature",
      version: "1.1.0",
      mapsource: "Wycombe/INSPIRE",
      typeName: id,
      maxfeatures: 1,
      bbox,
    },
  });

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
  const pt = bbox(x, y);

  try {
    const results = await Promise.all([
      search("LISTED_BUILDINGS", pt),
      search("CONSERVATION_AREAS", pt),
      search("ARTICLE_4S", pt),
      search("TREE_PRESERVATION_ORDERS", pt),
    ]);

    const ob = results
      .filter(([_key, result]) => !(result instanceof Error))
      .reduce(
        (acc, [key, result]) => {
          const k = `property.${names[key].key}`;
          try {
            const hasValue = !String(result).includes("gml:null");
            if (hasValue) {
              acc[k] = {
                text: names[key].pos,
                value: true,
                type: "warning",
                data: {},
              };
            } else {
              acc[k] = {
                text: names[key].neg,
                value: false,
                type: "check",
                data: {},
              };
            }
          } catch (err) {
            console.error({ err });
          }

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
