import "isomorphic-fetch";
import { addDesignatedVariable, omitGeometry } from "./helpers";
import { baseSchema } from "./local_authorities/metadata/base.js";
import { adminGraphQLClient as client } from "../hasura";

const localAuthorityMetadata = {
  buckinghamshire: require("./local_authorities/metadata/buckinghamshire.js"),
  canterbury: require("./local_authorities/metadata/canterbury.js"),
  doncaster: require("./local_authorities/metadata/doncaster.js"),
  lambeth: require("./local_authorities/metadata/lambeth.js"),
  medway: require("./local_authorities/metadata/medway.js"),
  southwark: require("./local_authorities/metadata/southwark.js"),
};

/**
 *
 * Query planning constraints datasets that intersect a given geometry and return results in the planx schema format
 *   using the Digital Land API https://www.planning.data.gov.uk/
 *
 * @param localAuthority (string) - planx team name used to link granular Article 4 metadata
 * @param geom (string) - WKT POLYGON or POINT, prioritized drawn site boundary and fallsback to unbuffered address point
 * @param extras (dict) - optional query params like "analytics" & "sessionId" used to decide if we should audit the raw response
 *
 * @returns { url: string, constraints: { [planx_variable]: { value: bool, text: string, data?: [] }}}
 *   an object with the original request URL for debugging/auditing & a dictionary of constraints
 *
 */
async function go(localAuthority, geom, extras) {
  // generate list of digital land datasets we should query based on 'active' planx schema variables
  let activeDatasets = [];
  Object.keys(baseSchema).forEach((key) => {
    if (baseSchema[key]["active"]) {
      baseSchema[key]["digital-land-datasets"].forEach((dataset) => {
        activeDatasets.push(dataset);
      });
    }
  });

  // set up request query params per https://www.planning.data.gov.uk/docs
  let options = {
    entries: "current",
    geometry: geom,
    geometry_relation: "intersects",
    limit: 100, // TODO handle pagination in future for large polygons & many datasets, but should be well within this limit now
  };
  // 'dataset' param is not array[string] per docs, instead re-specify param name per unique dataset
  let datasets = `&dataset=${[...new Set(activeDatasets)].join(`&dataset=`)}`;

  // fetch records from digital land, will return '{ count: 0, entities: [], links: {..} }' if no intersections
  let url = `https://www.planning.data.gov.uk/entity.json?${new URLSearchParams(
    options
  )}${datasets}`;
  const res = await fetch(url)
    .then((response) => response.json())
    .catch((error) => console.log(error));

  // if analytics are "on", store an audit record of the raw response
  if (extras?.analytics !== "false") {
    const record = await client.request(
      `
          mutation CreatePlanningConstraintsRequest(
            $destination_url: String = "",
            $response: jsonb = {},
            $session_id: String = "",
          ) {
            insert_planning_constraints_requests_one(object: {
              destination_url: $destination_url,
              response: $response
              session_id: $session_id,
            }) {
              id
            }
          }
        `,
      {
        destination_url: url,
        response: res,
        session_id: extras?.sessionId,
      }
    );
  }

  // --- INTERSECTIONS ---
  // check for & add any 'positive' constraints to the formattedResult
  let formattedResult = {};
  if (res && res.count > 0 && res.entities) {
    res.entities.forEach((entity) => {
      // get the planx variable that corresponds to this entity's 'dataset', should never be null because our initial request is filtered on 'dataset'
      const key = Object.keys(baseSchema).find((key) =>
        baseSchema[key]["digital-land-datasets"].includes(entity.dataset)
      );
      // because there can be many digital land datasets per planx variable, check if this key is already in our result
      if (Object.keys(formattedResult).includes(key)) {
        formattedResult[key]["data"].push(omitGeometry(entity));
      } else {
        formattedResult[key] = {
          value: true,
          text: baseSchema[key].pos,
          data: [omitGeometry(entity)],
          category: baseSchema[key].category,
          key: key,
        };
      }
    });
  }

  // --- NOTS ---
  // add active, non-intersecting planning constraints to the formattedResult
  // TODO followup with digital land about how to return 'nots' via API (currently assumes any "active" metadata was successfully queried)
  const nots = Object.keys(baseSchema).filter(
    (key) =>
      baseSchema[key]["active"] && !Object.keys(formattedResult).includes(key)
  );
  nots.forEach((not) => {
    formattedResult[not] = { 
      value: false, 
      text: baseSchema[not].neg, 
      category: baseSchema[not].category, 
      key: not,
    };
  });

  // --- DESIGNATED LAND ---
  // add top-level 'designated' variable based on granular query results
  formattedResult = addDesignatedVariable(formattedResult);

  // set granular `designated.nationalPark.broads` based on entity id (eventually extract to helper method if other cases like this)
  const broads = "designated.nationalPark.broads";
  if (
    formattedResult["designated.nationalPark"] &&
    formattedResult["designated.nationalPark"].value
  ) {
    formattedResult["designated.nationalPark"].data.forEach((entity) => {
      if (baseSchema[broads]["digital-land-entities"].includes(entity.entity)) {
        formattedResult[broads] = { value: true, text: baseSchema[broads].pos };
      }
    });
  } else {
    // only add the granular variable if the response already includes the parent one
    if (formattedResult["designated.nationalPark"])
      formattedResult[broads] = { value: false };
  }

  // --- LISTED BUILDINGS ---
  // TODO add granular variables to reflect grade (eg `listed.grade1`), not reflected in content yet though

  // --- ARTICLE 4S ---
  // only attempt to set granular a4s if we have metadata for this local authority; proceed with non-granular a4 queries under "opensystemslab" team etc
  if (Object.keys(localAuthorityMetadata).includes(localAuthority)) {
    // get the article 4 schema map for this local authority
    const { planningConstraints } = localAuthorityMetadata[localAuthority];
    const a4s = planningConstraints["article4"]["records"] || undefined;

    // loop through any intersecting a4 data entities and set granular planx values based on this local authority's schema
    if (a4s && formattedResult["article4"].value) {
      formattedResult["article4"].data.forEach((entity) => {
        Object.keys(a4s).forEach((key) => {
          if (
            // these are various ways we link source data to granular planx values (see local_authorities/metadata for specifics)
            entity.name.replace(/\r?\n|\r/g, " ") === a4s[key] ||
            entity.reference === a4s[key] ||
            entity?.notes === a4s[key] ||
            entity?.description?.startsWith(a4s[key]) ||
            formattedResult[key]?.value // if this granular var is already true, make sure it remains true
          ) {
            formattedResult[key] = { value: true };
          } else {
            formattedResult[key] = { value: false };
          }
        });
      });
    }

    // rename `article4.caz` to reflect localAuthority if applicable
    const localCaz = `article4.${localAuthority}.caz`;
    if (formattedResult["article4.caz"]) {
      formattedResult[localCaz] = formattedResult["article4.caz"];
      delete formattedResult["article4.caz"];

      // if caz is true, but parent a4 is false, sync a4 for accurate granularity
      if (
        formattedResult[localCaz].value &&
        !formattedResult["article4"].value
      ) {
        formattedResult["article4"] = {
          value: true,
          text: baseSchema["article4"].pos,
          data: formattedResult[localCaz].data,
        };
      }
    }
  }

  // --- METADATA ---
  // additionally fetch metadata from Digital Land's "dataset" endpoint for extra context
  let metadata = {};
  const urls = activeDatasets.map((dataset) => `https://www.planning.data.gov.uk/dataset/${dataset}.json`);
  await Promise.all(urls.map(url => 
    fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error))
  )).then((responses) => {
    responses.forEach((response) => {
      // get the planx variable that corresponds to this 'dataset', should never be null because we only requested known datasets
      const key = Object.keys(baseSchema).find((key) => baseSchema[key]["digital-land-datasets"].includes(response.dataset));
      metadata[key] = response;
    });
  }).catch(error => console.log(error));

  return { url: url, constraints: formattedResult, metadata: metadata };
}

async function locationSearch(localAuthority, geom, extras) {
  return go(localAuthority, geom, extras);
}

export { locationSearch };
