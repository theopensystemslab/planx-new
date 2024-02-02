import type {
  Constraint,
  GISResponse,
  Metadata,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import fetch from "isomorphic-fetch";
import { addDesignatedVariable, omitGeometry } from "./helpers";
import { baseSchema } from "./local_authorities/metadata/base";
import { $api } from "../../../client";

export interface LocalAuthorityMetadata {
  planningConstraints: {
    article4: {
      records: Record<string, string>;
    };
  };
}

/** When a team publishes their granular Article 4 data, add them to this list */
const localAuthorityMetadata: Record<string, LocalAuthorityMetadata> = {
  barkingAndDagenham: require("./local_authorities/metadata/barkingAndDagenham"),
  barnet: require("./local_authorities/metadata/barnet"),
  birmingham: require("./local_authorities/metadata/birmingham"),
  buckinghamshire: require("./local_authorities/metadata/buckinghamshire"),
  camden: require("./local_authorities/metadata/camden"),
  canterbury: require("./local_authorities/metadata/canterbury"),
  doncaster: require("./local_authorities/metadata/doncaster"),
  lambeth: require("./local_authorities/metadata/lambeth"),
  medway: require("./local_authorities/metadata/medway"),
  newcastle: require("./local_authorities/metadata/newcastle"),
  southwark: require("./local_authorities/metadata/southwark"),
};

/**
 *
 * Query planning constraints datasets that intersect a given geometry and return results in the planx schema format
 *   using the Digital Land API https://www.planning.data.gov.uk/
 *
 * @param localAuthority (string) - planx team name used to link granular Article 4 metadata
 * @param geom (string) - WKT POLYGON or POINT, prioritizes drawn site boundary and falls back to unbuffered address point
 * @param extras (dict) - optional query params like "analytics" & "sessionId" used to decide if we should audit the raw response
 *
 */
async function go(
  localAuthority: string,
  geom: string,
  extras: Record<string, string>,
): Promise<GISResponse> {
  // generate list of digital land datasets we should query based on 'active' planx schema variables
  const activeDatasets: string[] = [];
  Object.keys(baseSchema).forEach((key) => {
    if (baseSchema[key]["active"]) {
      baseSchema[key]["digital-land-datasets"]?.forEach((dataset: string) => {
        activeDatasets.push(dataset);
      });
    }
  });

  // set up request query params per https://www.planning.data.gov.uk/docs
  const options = {
    entries: "current",
    geometry: geom,
    geometry_relation: "intersects",
    limit: "100", // TODO handle pagination in future for large polygons & many datasets, but should be well within this limit now
  };
  // 'dataset' param is not array[string] per docs, instead re-specify param name per unique dataset
  const datasets = `&dataset=${[...new Set(activeDatasets)].join(`&dataset=`)}`;

  // fetch records from digital land, will return '{ count: 0, entities: [], links: {..} }' if no intersections
  const url = `https://www.planning.data.gov.uk/entity.json?${new URLSearchParams(
    options,
  )}${datasets}`;
  const res = await fetch(url)
    .then((response: { json: () => any }) => response.json())
    .catch((error: any) => console.log(error));

  // if analytics are "on", store an audit record of the raw response
  if (extras?.analytics !== "false") {
    const _auditRecord = await $api.client.request(
      gql`
        mutation CreatePlanningConstraintsRequest(
          $destination_url: String = ""
          $response: jsonb = {}
          $session_id: String = ""
        ) {
          insert_planning_constraints_requests_one(
            object: {
              destination_url: $destination_url
              response: $response
              session_id: $session_id
            }
          ) {
            id
          }
        }
      `,
      {
        destination_url: url,
        response: res,
        session_id: extras?.sessionId,
      },
    );
  }

  // --- INTERSECTIONS ---
  // check for & add any 'positive' constraints to the formattedResult
  let formattedResult: Record<string, Constraint> = {};
  if (res && res.count > 0 && res.entities) {
    res.entities.forEach((entity: { dataset: any }) => {
      // get the planx variable that corresponds to this entity's 'dataset', should never be null because our initial request is filtered on 'dataset'
      const key = Object.keys(baseSchema).find((key) =>
        baseSchema[key]["digital-land-datasets"]?.includes(entity.dataset),
      );
      // because there can be many digital land datasets per planx variable, check if this key is already in our result
      if (key && Object.keys(formattedResult).includes(key)) {
        formattedResult[key]["data"]?.push(omitGeometry(entity));
      } else {
        if (key) {
          formattedResult[key] = {
            fn: key,
            value: true,
            text: baseSchema[key].pos,
            data: [omitGeometry(entity)],
            category: baseSchema[key].category,
          };
        }
      }
    });
  }

  // --- NOTS ---
  // add active, non-intersecting planning constraints to the formattedResult
  // TODO followup with digital land about how to return 'nots' via API (currently assumes any "active" metadata was successfully queried)
  const nots = Object.keys(baseSchema).filter(
    (key) =>
      baseSchema[key]["active"] && !Object.keys(formattedResult).includes(key),
  );
  nots.forEach((not) => {
    formattedResult[not] = {
      fn: not,
      value: false,
      text: baseSchema[not].neg,
      category: baseSchema[not].category,
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
    formattedResult["designated.nationalPark"]?.data?.forEach((entity: any) => {
      if (
        baseSchema[broads]["digital-land-entities"]?.includes(entity.entity)
      ) {
        formattedResult[broads] = {
          fn: broads,
          value: true,
          text: baseSchema[broads].pos,
        };
      }
    });
  } else {
    // only add the granular variable if the response already includes the parent one
    if (formattedResult["designated.nationalPark"])
      formattedResult[broads] = { fn: broads, value: false };
  }

  // FLOODING
  if (formattedResult["flood"] && formattedResult["flood"].value) {
    ["flood.zone.1", "flood.zone.2", "flood.zone.3"].forEach(
      (zone) =>
        (formattedResult[zone] = {
          fn: zone,
          value: Boolean(
            formattedResult["flood"].data?.filter(
              (entity) => entity["flood-risk-level"] === zone.split(".").pop(),
            ).length,
          ),
        }),
    );
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
      formattedResult["article4"]?.data?.forEach((entity: any) => {
        Object.keys(a4s)?.forEach((key) => {
          if (
            // these are various ways we link source data to granular planx values (see local_authorities/metadata for specifics)
            entity.name.replace(/\r?\n|\r/g, " ") === a4s[key] ||
            entity.reference === a4s[key] ||
            entity?.["article-4-direction"] === a4s[key] ||
            entity?.notes === a4s[key] ||
            entity?.description?.startsWith(a4s[key]) ||
            formattedResult[key]?.value // if this granular var is already true, make sure it remains true
          ) {
            formattedResult[key] = { fn: key, value: true };
          } else {
            formattedResult[key] = { fn: key, value: false };
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
          fn: "article4",
          value: true,
          text: baseSchema["article4"].pos,
          data: formattedResult[localCaz].data,
          category: baseSchema["article4"].category,
        };
      }
    }
  }

  // --- METADATA ---
  // additionally fetch metadata from Digital Land's "dataset" endpoint for extra context
  const metadata: Record<string, Metadata> = {};
  const urls = activeDatasets.map(
    (dataset) => `https://www.planning.data.gov.uk/dataset/${dataset}.json`,
  );
  await Promise.all(
    urls.map((url) =>
      fetch(url)
        .then((response: { json: () => any }) => response.json())
        .catch((error: any) => console.log(error)),
    ),
  )
    .then((responses) => {
      responses.forEach((response: any) => {
        // get the planx variable that corresponds to this 'dataset', should never be null because we only requested known datasets
        const key = Object.keys(baseSchema).find((key) =>
          baseSchema[key]["digital-land-datasets"]?.includes(response.dataset),
        );
        if (key) metadata[key] = response;
      });
    })
    .catch((error) => console.log(error));

  return {
    sourceRequest: url,
    constraints: formattedResult,
    metadata: metadata,
  };
}

async function locationSearch(
  localAuthority: string,
  geom: string,
  extras: Record<string, string>,
) {
  return go(localAuthority, geom, extras);
}

export { locationSearch };
