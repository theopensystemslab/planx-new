require("isomorphic-fetch");

const { makeBboxWkt, omitGeojson } = require("./helpers");
const { baseSchema } = require("./local_authorities/metadata/base.js");
const { digitalLandDatasets } = require("./local_authorities/metadata/digital-land-datasets.js");

async function go(x, y, siteBoundary, extras) {
  try {
    // use drawn site boundary if available, fallback to buffered address point
    const geom = siteBoundary ? siteBoundary : makeBboxWkt(x, y, 0.05);

    // https://www.digital-land.info/docs#/
    let options = {
      entries: "current", // all, current, historical
      geometry: geom, // WKT format
      geometry_relation: "intersects", // within, equals, disjoint, intersects, touches, contains, covers, coveredby, overlaps, crosses
      limit: 100,
      offset: 0,
    };
    let url = `https://www.digital-land.info/entity.json?${new URLSearchParams(options)}`;
    
    // results.entities will ONLY return intersecting aka "positive" constraints
    const results = await fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error));

    let formattedResult = {};
    results.entities.forEach(entity => {
      const key = digitalLandDatasets[entity.dataset];
      
      // filter the digital land response for datasets included in the planx base schema
      if (Object.keys(baseSchema).includes(key)) {
        // because there can be many digital datasets per planx variable, check if we need to add this key to constraints or just append data
        if (!Object.keys(formattedResult).includes(key)) {
          formattedResult[key] = {
            value: true,
            text: baseSchema[key].pos,
            data: [omitGeojson(entity)],
          };
        } else {
          formattedResult[key]["data"].push(omitGeojson(entity));
        }
      }
    });

    // TODO: do second request to get denominator of all datasets available for this council (aka "negative" constraints) & concat to formattedResult
    // use local authority boundary as polygon for this case & get all datasets within??

    return formattedResult;
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
