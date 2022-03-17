require("isomorphic-fetch");

const { omitGeojson, addDesignatedVariable } = require("../helpers");
const { baseSchema } = require("./metadata/base.js");

/* 
 * Query planning constraints datasets that intersect a given geometry and return results in the planx schema format
 *   using the Digital Land API https://www.digital-land.info/
 * 
 * @param localAuthority (string) - planx team name used to link granular article 4 metadata
 * @param geom (string) - WKT POLYGON or POINT, prioritizes drawn site boundary and fallsback to unbuffered address point
 * 
 * @returns an object with the original request URL for debugging/auditing & a dictionary of constraints
 *   {
 *     url: string,
 *     constraints: { [planx_variable]: {value: bool, text: string, data?: [] }
 *   }
 */
async function go(localAuthority, geom) {
  // generate list of digital land datasets we should query based on 'active' planx schema variables
  let activeDatasets = [];
  Object.keys(baseSchema).forEach(key => {
    if (baseSchema[key]["active"]) {
      baseSchema[key]["digital-land-datasets"].forEach(dataset => {
        activeDatasets.push(dataset);
      });
    }
  });

  try {
    // set up request query params per https://www.digital-land.info/docs#/
    let options = {
      entries: "current",
      geometry: geom,
      geometry_relation: "intersects",
      limit: 100, // TODO handle pagination in future for large polygons & many datasets, but should be well within this limit now
    };
    // 'dataset' param is not array[string] per docs, instead re-specify param name per dataset
    let datasets = `&dataset=${activeDatasets.join(`&dataset=`)}`;

    // fetch records from digital land, will return '{ count: 0, entities: [], links: {..} }' if no intersections
    let url = `https://www.digital-land.info/entity.json?${new URLSearchParams(options)}${datasets}`;
    const res = await fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error));

    // check for & add any 'positive'/intersecting constraints to the formattedResult
    let formattedResult = {};
    if (res && res.count > 0 && res.entities) {
      res.entities.forEach(entity => {
        // get the planx variable that corresponds to this entity's 'dataset', should never be null because our initial request is filtered on 'dataset'
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

    // add active, non-intersecting planning constraints to the formattedResult
    // TODO followup with digital land about how to return 'nots' via API (currently assumes any "active" metadata was successfully queried during request)
    const nots = Object.keys(baseSchema).filter(key => baseSchema[key]["active"] && !Object.keys(formattedResult).includes(key));
    nots.forEach(not => {
      formattedResult[not] = { value: false, text: baseSchema[not].neg };
    });

    // add top-level 'designated' variable based on granular query results
    let formattedResultWithDesignated = addDesignatedVariable(formattedResult);

    // TODO add granular article 4 variables to formattedResult based on metadata mappings per localAuthority

    return { url: url, constraints: formattedResultWithDesignated };
  } catch (e) {
    throw e;
  }
}

async function locationSearch(localAuthority, geom) {
  return go(localAuthority, geom);
}

module.exports = {
  locationSearch,
};
