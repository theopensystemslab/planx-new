import {
  type PlanxConstraint,
  type PlanxGISResponse,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import {
  addArticle4s,
  addDesignatedVariable,
  addFloodZone,
  addIntersections,
  addListedBuildingGrade,
  addNots,
  fetchConstraintsFromPlanningData,
  fetchMetadataFromPlanningData,
  getActivePlanningDataConstraints,
  renameArticle4CAZ,
  setGranularNationalPark,
} from "./helpers.js";

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
): Promise<PlanxGISResponse> {
  // Get active planning constraints sourced from "Planning Data" only
  const baseSchema = getActivePlanningDataConstraints();

  // Generate list of datasets we should query and their associated passport values
  const activeDatasets: string[] = [];
  let activeDataValues: string[] = [];
  if (extras?.vals) {
    // If the editor has selected constraints, prioritise their selection
    activeDataValues = extras.vals.split(",");
    Object.keys(baseSchema).forEach((key) => {
      if (activeDataValues.includes(key)) {
        baseSchema[key]["digital-land-datasets"]?.forEach((dataset: string) => {
          activeDatasets.push(dataset);
        });
      }
    });
  } else {
    // Else default to the internally maintained list of all "active" datasets
    Object.keys(baseSchema).forEach((key) => {
      activeDataValues = Object.keys(baseSchema);
      baseSchema[key]["digital-land-datasets"]?.forEach((dataset: string) => {
        activeDatasets.push(dataset);
      });
    });
  }

  // Fetch constraints from Planning Data
  const { res, url } = await fetchConstraintsFromPlanningData(
    geom,
    activeDatasets,
  );

  // If analytics are "on", store an audit record of the raw response
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
  // Check for & add any 'positive' constraints to the formattedResult
  let formattedResult: PlanxConstraint = {};
  if (res && res.count > 0 && res.entities) {
    formattedResult = addIntersections(res, baseSchema, formattedResult);
  }

  // --- NOTS ---
  // Add active, non-intersecting planning constraints to the formattedResult
  // TODO followup with PD about how to distinguish 'nots' via API response (eg "false negatives" issue)
  formattedResult = addNots(activeDataValues, baseSchema, formattedResult);

  // --- DESIGNATED LAND ---
  // add top-level 'designated' variable based on granular query results
  formattedResult = addDesignatedVariable(formattedResult);

  // Set granular `designated.nationalPark.broads` based on entity ID
  formattedResult = setGranularNationalPark(baseSchema, formattedResult);

  // --- FLOODING ---
  formattedResult = addFloodZone(formattedResult);

  // --- LISTED BUILDINGS ---
  formattedResult = addListedBuildingGrade(formattedResult);

  // --- ARTICLE 4S ---
  // Only attempt to set granular a4s if we have metadata for this local authority; proceed with non-granular a4 queries under "opensystemslab" team etc
  if (Object.keys(localAuthorityMetadata).includes(localAuthority)) {
    // Get the article 4 schema map for this local authority
    const { planningConstraints } = localAuthorityMetadata[localAuthority];
    const a4s = planningConstraints["articleFour"]["records"] || undefined;

    // Loop through any intersecting a4 data entities and set granular planx values based on this local authority's schema
    if (a4s && formattedResult["articleFour"]?.value) {
      formattedResult = addArticle4s(a4s, formattedResult);
    }

    // Rename `articleFour.caz` to reflect localAuthority if applicable, ensuring `councilName` segment matches other A4 values (not always same as team-slug)
    formattedResult = renameArticle4CAZ(
      localAuthority,
      baseSchema,
      formattedResult,
    );
  }

  // --- METADATA ---
  // Additionally fetch metadata from Digital Land's "dataset" endpoint for extra context
  const metadata = await fetchMetadataFromPlanningData(
    activeDatasets,
    baseSchema,
  );

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
