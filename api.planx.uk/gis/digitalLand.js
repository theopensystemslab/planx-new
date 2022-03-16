require("isomorphic-fetch");

const { omitGeojson } = require("./helpers");
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
    // https://www.digital-land.info/docs#/
    let options = {
      entries: "current",
      geometry: siteBoundary, // TODO decide if/how to buffer - using drawn POLYGON or falling back on unbuffered POINT now
      geometry_relation: "intersects",
      limit: 100,
    };
    // 'dataset' param is not array[string] per docs, instead need to re-specify param name per dataset
    let datasets = `&dataset=${activeDatasets.join(`&dataset=`)}`;
    
    // fetch records from digital land, will return {} if no intersections
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
  
        // because there can be many digital land entities per planx variable, check if this key is already in our result
        if (Object.keys(formattedResult).includes(key)) {
          formattedResult[key]["data"].push(omitGeojson(entity));
        } else {
          formattedResult[key] = {
            value: true,
            text: baseSchema[key].pos,
            data: [omitGeojson(entity)],
          };
        }
      });
    }

    // add active, non-intersecting planning constraints to the formatted result
    // TODO followup with digital land about how to return 'nots' via API (currently just human assumption these datasets were actually checked!)
    const nots = Object.keys(baseSchema).filter(key => baseSchema[key]["active"] && !Object.keys(formattedResult).includes(key));
    nots.forEach(not => {
      formattedResult[not] = { value: false, text: baseSchema[not].neg };
    });

    // TODO add granular article 4 variables to the formatted result based on specific council

    return { url: url, constraints: formattedResult };
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
