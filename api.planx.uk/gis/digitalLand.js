require("isomorphic-fetch");

const { omitGeojson, addDesignatedVariable } = require("./helpers");
const { baseSchema } = require("./local_authorities/metadata/base.js");

const localAuthorityMetadata = {
  "buckinghamshire": require("./local_authorities/metadata/buckinghamshire.js"),
  "lambeth": require("./local_authorities/metadata/lambeth.js"),
  "southwark": require("./local_authorities/metadata/southwark.js"),
};

/**
 * 
 * Query planning constraints datasets that intersect a given geometry and return results in the planx schema format
 *   using the Digital Land API https://www.digital-land.info/
 * 
 * @param localAuthority (string) - planx team name used to link granular Article 4 metadata
 * @param geom (string) - WKT POLYGON or POINT, prioritized drawn site boundary and fallsback to unbuffered address point
 * 
 * @returns { url: string, constraints: { [planx_variable]: { value: bool, text: string, data?: [] }}}
 *   an object with the original request URL for debugging/auditing & a dictionary of constraints
 * 
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

    // --- INTERSECTIONS ---
    // check for & add any 'positive' constraints to the formattedResult
    let formattedResult = {};
    if (res && res.count > 0 && res.entities) {
      res.entities.forEach(entity => {
        // get the planx variable that corresponds to this entity's 'dataset', should never be null because our initial request is filtered on 'dataset'
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
      });
    }

    // --- NOTS --- 
    // add active, non-intersecting planning constraints to the formattedResult
    // TODO followup with digital land about how to return 'nots' via API (currently assumes any "active" metadata was successfully queried)
    const nots = Object.keys(baseSchema).filter(key => baseSchema[key]["active"] && !Object.keys(formattedResult).includes(key));
    nots.forEach(not => {
      formattedResult[not] = { value: false, text: baseSchema[not].neg };
    });

    // --- DESIGNATED LAND ---
    // add top-level 'designated' variable based on granular query results
    formattedResult = addDesignatedVariable(formattedResult);

    // --- ARTICLE 4 ---
    // only attempt to set granular a4s if we have metadata for this local authority; proceed with non-granular a4 queries under "opensystemslab" team etc
    if (Object.keys(localAuthorityMetadata).includes(localAuthority)) {
      // get the article 4 schema map for this local authority
      const { planningConstraints } = localAuthorityMetadata[localAuthority];
      const a4s = planningConstraints["article4"]["records"] || undefined; // TODO account for Southwark

      // loop through any intersecting a4 data entities and set granular planx values based on this local authority's schema
      if (a4s && formattedResult["article4"].value) {
        formattedResult["article4"].data.forEach((entity) => {
          (Object.keys(a4s)).forEach((key) => {
            // Digital Land's entity.name maps to Buck's DEV_TYPE (which can have line breaks), Lambeth's ..., Southwark's ...
            if (entity.name.replace(/\r?\n|\r/g, " ") === a4s[key] || formattedResult[key]?.value) {
              formattedResult[key] = { value: true }
            // DL's entity.json.notes maps to Buck's DESCRIPTIO, Lambeth's ..., Southwark's ...
            } else if (entity.json.notes.startsWith(a4s[key]) || formattedResult[key]?.value) {
              formattedResult[key] = { value: true }
            } else {
              formattedResult[key] = { value: false }
            }
          });
        });
      }
    }

    // TODO add helper function to set 'designated.broads' based on 'designated.nationalPark' entity id

    // TODO add helper function to concatenate grade onto the listed building text if "pos" (and add granular schema var?)

    return { url: url, constraints: formattedResult };
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
