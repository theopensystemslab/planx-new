import {
  activePlanningConstraints,
  type Constraint,
  type DigitalLandConstraint,
  type GISResponse,
  type Metadata,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import fetch from "isomorphic-fetch";
import { addDesignatedVariable } from "./helpers.js";
import { $api } from "../../../client/index.js";

import * as barkingAndDagenham from "./local_authorities/metadata/barkingAndDagenham.js";
import * as barnet from "./local_authorities/metadata/barnet.js";
import * as birmingham from "./local_authorities/metadata/birmingham.js";
import * as buckinghamshire from "./local_authorities/metadata/buckinghamshire.js";
import * as camden from "./local_authorities/metadata/camden.js";
import * as canterbury from "./local_authorities/metadata/canterbury.js";
import * as doncaster from "./local_authorities/metadata/doncaster.js";
import * as epsomAndEwell from "./local_authorities/metadata/epsomAndEwell.js";
import * as gateshead from "./local_authorities/metadata/gateshead.js";
import * as gloucester from "./local_authorities/metadata/gloucester.js";
import * as lambeth from "./local_authorities/metadata/lambeth.js";
import * as medway from "./local_authorities/metadata/medway.js";
import * as newcastle from "./local_authorities/metadata/newcastle.js";
import * as southwark from "./local_authorities/metadata/southwark.js";
import * as stAlbans from "./local_authorities/metadata/stAlbans.js";
import * as tewkesbury from "./local_authorities/metadata/tewkesbury.js";
import * as westBerkshire from "./local_authorities/metadata/westBerkshire.js";

export interface LocalAuthorityMetadata {
  planningConstraints: {
    articleFour: {
      records: Record<string, string>;
    };
  };
}

/**
 * When a team publishes their granular Article 4 data, add them to this list. Key must match team slug
 * The database column team_setting.has_article4_schema also needs to be updated via the Hasura console
 */
export const localAuthorityMetadata: Record<string, LocalAuthorityMetadata> = {
  "barking-and-dagenham": barkingAndDagenham,
  barnet,
  birmingham,
  buckinghamshire,
  camden,
  canterbury,
  doncaster,
  "epsom-and-ewell": epsomAndEwell,
  gateshead,
  gloucester,
  lambeth,
  medway,
  newcastle,
  southwark,
  "st-albans": stAlbans,
  tewkesbury,
  "west-berkshire": westBerkshire,
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
  // get active planning constraints sourced from "Planning Data" only
  const activePlanningConstraintsCopy = activePlanningConstraints;
  delete activePlanningConstraintsCopy["roads.classified"];
  const baseSchema = activePlanningConstraintsCopy as Record<
    string,
    DigitalLandConstraint
  >;

  // generate list of digital land datasets we should query and their associated passport values
  const activeDatasets: string[] = [];
  let activeDataValues: string[] = [];
  if (extras?.vals) {
    // if the editor selected constraints, prioritise their selection
    activeDataValues = extras.vals.split(",");
    Object.keys(baseSchema).forEach((key) => {
      if (activeDataValues.includes(key)) {
        baseSchema[key]["digital-land-datasets"]?.forEach((dataset: string) => {
          activeDatasets.push(dataset);
        });
      }
    });
  } else {
    // else default to the internally maintained list of all "active" datasets
    Object.keys(baseSchema).forEach((key) => {
      activeDataValues = Object.keys(baseSchema);
      baseSchema[key]["digital-land-datasets"]?.forEach((dataset: string) => {
        activeDatasets.push(dataset);
      });
    });
  }

  // set up request query params per https://www.planning.data.gov.uk/docs
  const options = {
    entries: "current",
    geometry: geom,
    geometry_relation: "intersects",
    exclude_field: "geometry,point",
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
        formattedResult[key]["data"]?.push(entity);
      } else {
        if (key) {
          formattedResult[key] = {
            fn: key,
            value: true,
            text: baseSchema[key].pos,
            data: [entity],
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
      activeDataValues.includes(key) &&
      !Object.keys(formattedResult).includes(key),
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

  // --- FLOODING ---
  const zoneLookup: Record<string, string> = {
    "flood.zone.2": "flood.zoneTwo",
    "flood.zone.3": "flood.zoneThree",
  };
  if (formattedResult["flood"] && formattedResult["flood"].value) {
    Object.keys(zoneLookup).forEach(
      (oldZone) =>
        (formattedResult[zoneLookup[oldZone]] = {
          fn: zoneLookup[oldZone],
          value: Boolean(
            formattedResult["flood"].data?.filter(
              (entity) =>
                entity["flood-risk-level"] === oldZone.split(".").pop(),
            ).length,
          ),
        }),
    );
  }

  // --- LISTED BUILDINGS ---
  const gradeLookup: Record<string, string> = {
    "listed.grade.I": "listed.gradeOne",
    "listed.grade.II": "listed.gradeTwo",
    "listed.grade.II*": "listed.gradeTwoStar",
  };
  if (formattedResult["listed"] && formattedResult["listed"].value) {
    Object.keys(gradeLookup).forEach(
      (oldGrade) =>
        (formattedResult[gradeLookup[oldGrade]] = {
          fn: gradeLookup[oldGrade],
          value: Boolean(
            formattedResult["listed"].data?.filter(
              (entity) =>
                entity["listed-building-grade"] === oldGrade.split(".").pop(),
            ).length,
          ),
        }),
    );
  }

  // --- ARTICLE 4S ---
  // only attempt to set granular a4s if we have metadata for this local authority; proceed with non-granular a4 queries under "opensystemslab" team etc
  if (Object.keys(localAuthorityMetadata).includes(localAuthority)) {
    // get the article 4 schema map for this local authority
    const { planningConstraints } = localAuthorityMetadata[localAuthority];
    const a4s = planningConstraints["articleFour"]["records"] || undefined;

    // loop through any intersecting a4 data entities and set granular planx values based on this local authority's schema
    if (a4s && formattedResult["articleFour"]?.value) {
      formattedResult["articleFour"]?.data?.forEach((entity: any) => {
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

    // rename `articleFour.caz` to reflect localAuthority if applicable, ensuring `councilName` segment matches other A4 values (not always same as team-slug)
    const customTeamSlugs: Record<string, string> = {
      "barking-and-dagenham": "barkingAndDagenham",
      "epsom-and-ewell": "epsomAndEwell",
      "st-albans": "stAlbans",
      "west-berkshire": "westBerkshire",
    };
    const localCaz = Object.keys(customTeamSlugs).includes(localAuthority)
      ? `articleFour.${customTeamSlugs[localAuthority]}.caz`
      : `articleFour.${localAuthority}.caz`;
    if (formattedResult["articleFour.caz"]) {
      formattedResult[localCaz] = formattedResult["articleFour.caz"];
      delete formattedResult["articleFour.caz"];

      // if caz is true, but parent a4 is false, sync a4 for accurate granularity
      if (
        formattedResult[localCaz]?.value &&
        !formattedResult["articleFour"]?.value
      ) {
        formattedResult["articleFour"] = {
          fn: "articleFour",
          value: true,
          text: baseSchema["articleFour"].pos,
          data: formattedResult[localCaz].data,
          category: baseSchema["articleFour"].category,
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
