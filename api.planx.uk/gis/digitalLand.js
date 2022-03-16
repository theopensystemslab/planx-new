require("isomorphic-fetch");

const { makeBboxWkt, omitGeojson } = require("./helpers");
const { baseSchema } = require("./local_authorities/metadata/base.js");

// generate list of digital land datasets we want to query
// based on availability here https://digital-land-maturity-model.herokuapp.com/performance/
let activeDatasets = [];
Object.keys(baseSchema).forEach(key => {
  if (baseSchema[key]["active"]) {
    baseSchema[key]["digital-land-datasets"].forEach(dataset => {
      activeDatasets.push(dataset);
    });
  }
});

async function go(x, y, siteBoundary, extras) {
  try {
    // use drawn site boundary if available, fallback to buffered address point
    // digital land expects WKT format using projection 4326
    const geom = siteBoundary ? siteBoundary : makeBboxWkt(x, y, 0.05);

    // https://www.digital-land.info/docs#/
    let options = {
      entries: "current",
      geometry: geom,
      geometry_relation: "intersects",
      limit: 100,
    };
    let datasets = `&dataset=${activeDatasets.join(`&dataset=`)}`; // dataset param is not array[string] per docs, instead need to re-specify param name per dataset
    
    let url = `https://www.digital-land.info/entity.json?${new URLSearchParams(options)}${datasets}`;
    const results = await fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error));


    // results will ONLY be populated if we have "positive"/intersecting constraints
    let formattedResult = {};
    if (results && results.entities) {
      results.entities.forEach(entity => {
        // get the planx variable that corresponds to this entity's "dataset", should never be null because our initial request is filtered on "dataset"
        const key = Object.keys(baseSchema).find(key => baseSchema[key]["digital-land-datasets"].includes(entity.dataset));
  
        // because there can be many digital land datasets per planx variable, check if this key is already in our result
        if (Object.keys(formattedResult).includes(key)) {
          formattedResult[key]["data"].push(omitGeojson(entity));
        } else {
          formattedResult[key] = {
            value: true,
            text: baseSchema[key].pos,
            data: [omitGeojson(entity)],
          };
        }
      })
    } else {
      // TODO: generate list of planx variables with neg text using base schema??
      formattedResult = { error: "No intersecting constraints found", url: url };
    }

    // TODO: do second request to get denominator of all datasets available for this council (aka "negative" constraints) & concat to formattedResult
    // use local authority boundary as polygon for this case & get all datasets within?? won't hold up if local auth doesn't have a national park for example

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
