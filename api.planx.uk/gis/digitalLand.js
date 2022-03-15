require("isomorphic-fetch");

const { baseSchema } = require("./local_authorities/metadata/base.js");
const { digitalLandDatasets } = require("./local_authorities/metadata/digital-land-datasets.js");

async function go(x, y, siteBoundary, extras) {
  // TODO: handle x,y case when no siteBoundary is provided
  
  try {
    // https://www.digital-land.info/docs#/
    let url = `https://www.digital-land.info/entity.json?entries=all&geometry=${siteBoundary}&geometry_relation=intersects&limit=100`;
    const results = await fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error));

    const formattedResult = {};
    
    // results.entities currently _only_ returns intersecting datasets (aka "positive" constraints)
    results.entities.forEach(entity => {
      const key = digitalLandDatasets[entity.dataset];
      
      // filter the digital land response for datasets included in the planx base schema
      if (Object.keys(baseSchema).includes(key)) {
        formattedResult[key] = {
          value: true,
          text: baseSchema[key].pos,
          data: entity,
        };
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
