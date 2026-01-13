import {
  walesActivePlanningConstraints,
  type Constraint,
  type DataMapWalesConstraint,
  type GISResponse,
  type Metadata,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import fetch from "isomorphic-fetch";
import { addDesignatedVariable } from "./helpers.js";
import { $api } from "../../../client/index.js";

// List of Welsh council team slugs
const WALES_TEAMS = ["bannau-brycheiniog"];

export function isWalesTeam(teamSlug: string): boolean {
  return WALES_TEAMS.includes(teamSlug);
}

// Query DataMapWales
async function queryWFSLayer(
  constraint: DataMapWalesConstraint,
  geometry: string,
  geometryField: string,
): Promise<{ features: any[] }> {
  // parse WKT
  const isPoint = geometry.startsWith("POINT");

  let filterXml: string;

  // POINT(...)
  if (isPoint) {
    // Extract coordinates from POINT(lon lat)
    const coords = geometry.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if (!coords) throw new Error(`Invalid POINT geometry: ${geometry}`);

    filterXml = `
      <fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">
        <fes:Intersects>
          <fes:ValueReference>${geometryField}</fes:ValueReference>
          <gml:Point srsName="EPSG:4326">
            <gml:pos>${coords[1]} ${coords[2]}</gml:pos>
          </gml:Point>
        </fes:Intersects>
      </fes:Filter>
    `;
  }
  // POLYGON(...)
  else {
    // Extract coordinates from POLYGON((lon1 lat1, lon2 lat2, ...))
    const coords = geometry.match(/POLYGON\(\((.*?)\)\)/);
    if (!coords) throw new Error(`Invalid POLYGON geometry: ${geometry}`);

    // Convert "lon1 lat1, lon2 lat2, ..." to GML posList format
    const posList = coords[1]
      .split(",")
      .map((pair: string) => {
        const [lon, lat] = pair.trim().split(/\s+/);
        return `${lon} ${lat}`;
      })
      .join(" ");

    filterXml = `
      <fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">
        <fes:Intersects>
          <fes:ValueReference>${geometryField}</fes:ValueReference>
          <gml:Polygon srsName="EPSG:4326">
            <gml:exterior>
              <gml:LinearRing>
                <gml:posList>${posList}</gml:posList>
              </gml:LinearRing>
            </gml:exterior>
          </gml:Polygon>
        </fes:Intersects>
      </fes:Filter>
    `;
  }

  const params: Record<string, string> = {
    service: "WFS",
    request: "GetFeature",
    version: "2.0.0",
    typeNames: constraint["dmw-layer"],
    outputFormat: "application/json",
    filter: filterXml,
  };

  const url = `https://datamap.gov.wales/geoserver/wfs?${new URLSearchParams(
    params,
  ).toString()}`;

  try {
    const response = await fetch(url);

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type to detect XML error responses
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("xml")) {
      const xmlText = await response.text();
      console.error(
        `WFS returned XML error for ${constraint["dmw-layer"]}:\n${xmlText.substring(0, 500)}`,
      );
      return { features: [] };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(
      `Error querying ${constraint["dmw-layer"]}: ${error.message}`,
    );
    return { features: [] };
  }
}

/**
 *
 * Query planning constraints datasets that intersect a given geometry and return results in the planx schema format
 *   using DataMapWales APIs https://datamap.gov.wales
 *
 * @param localAuthority (string) - planx team name
 * @param geom (string) - WKT POLYGON or POINT, prioritizes drawn site boundary and falls back to unbuffered address point
 * @param extras (dict) - optional query params like "analytics" & "sessionId" used to decide if we should audit the raw response
 *
 */
async function go(
  localAuthority: string,
  geom: string,
  extras: Record<string, string>,
): Promise<GISResponse> {
  const baseSchema = walesActivePlanningConstraints as Record<
    string,
    DataMapWalesConstraint
  >;

  // Generate list of Wales datasets and constraints we should query
  const activeDatasets: string[] = [];
  let activeDataValues: string[] = [];
  if (extras?.vals) {
    // If the editor selected constraints, prioritise their selection
    activeDataValues = extras.vals.split(",");
  } else {
    // else default to all active Wales constraints
    activeDataValues = Object.keys(baseSchema);
  }

  // Filter to only query the requested constraints
  const constraintsToQuery = Object.entries(baseSchema).filter(([key]) =>
    activeDataValues.includes(key),
  );

  // Build list of active datasets (WFS layer names)
  constraintsToQuery.forEach(([key, constraint]) => {
    activeDatasets.push(constraint["dmw-layer"]);
  });

  // Query all WFS layers
  const queryResults = await Promise.all(
    constraintsToQuery.map(async ([key, constraint]) => {
      const geometryField = constraint["dmw-geometry-field"] || "geom";
      const result = await queryWFSLayer(constraint, geom, geometryField);
      return { key, constraint, result };
    }),
  );

  // --- INTERSECTIONS ---
  // Check for & add any 'positive' constraints to the formattedResult
  let formattedResult: Record<string, Constraint> = {};
  queryResults.forEach(({ key, constraint, result }) => {
    if (result?.features?.length > 0) {
      // ASNW: filter on category_name
      let features = result.features;
      if (key === "nature.ASNW") {
        features = result.features.filter(
          (f: any) =>
            f.properties.category_name === "Ancient Semi Natural Woodland",
        );
      }

      if (features.length > 0) {
        const entities = features.map((feature: any) => {
          const entity: Record<string, any> = {
            ...feature.properties,
          };

          // Add name field if specified
          if (constraint["dmw-name-field"]) {
            entity.name = feature.properties[constraint["dmw-name-field"]];
          }

          // Use feature id as entity identifier
          entity.entity = feature.id || feature.properties.id;

          return entity;
        });

        formattedResult[key] = {
          fn: key,
          value: true,
          text: constraint.pos,
          data: entities,
          category: constraint.category,
        };

        // listed buildings; check Grade attribute
        if (key === "listed") {
          const gradeOneEntities = entities.filter((e) => e.Grade === "I");
          const gradeTwoEntities = entities.filter((e) => e.Grade === "II");
          const gradeTwoStarEntities = entities.filter(
            (e) => e.Grade === "II*",
          );

          if (gradeOneEntities.length > 0) {
            formattedResult["listed.gradeOne"] = {
              fn: "listed.gradeOne",
              value: true,
              text: "is a Grade I Listed Building",
              data: gradeOneEntities,
              category: constraint.category,
            };
          }

          if (gradeTwoEntities.length > 0) {
            formattedResult["listed.gradeTwo"] = {
              fn: "listed.gradeTwo",
              value: true,
              text: "is a Grade II Listed Building",
              data: gradeTwoEntities,
              category: constraint.category,
            };
          }

          if (gradeTwoStarEntities.length > 0) {
            formattedResult["listed.gradeTwoStar"] = {
              fn: "listed.gradeTwoStar",
              value: true,
              text: "is a Grade II* Listed Building",
              data: gradeTwoStarEntities,
              category: constraint.category,
            };
          }
        }

        // flooding; split by zone
        if (key === "flood") {
          const zoneTwoEntities = entities.filter(
            (e) => e.risk === "Flood Zone 2",
          );
          const zoneThreeEntities = entities.filter(
            (e) => e.risk === "Flood Zone 3",
          );

          if (zoneTwoEntities.length > 0) {
            formattedResult["flood.zoneTwo"] = {
              fn: "flood.zoneTwo",
              value: true,
              text: "is in Flood Zone 2",
              data: zoneTwoEntities,
              category: constraint.category,
            };
          }

          if (zoneThreeEntities.length > 0) {
            formattedResult["flood.zoneThree"] = {
              fn: "flood.zoneThree",
              value: true,
              text: "is in Flood Zone 3",
              data: zoneThreeEntities,
              category: constraint.category,
            };
          }
        }
      }
    }
  });

  // --- NOTS ---
  // Add active, non-intersecting planning constraints to the formattedResult
  const nots = activeDataValues.filter(
    (key) => !Object.keys(formattedResult).includes(key),
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
  // Add top-level 'designated' variable based on granular query results
  formattedResult = addDesignatedVariable(formattedResult);

  // --- METADATA ---
  // Generate basic metadata with DataMapWales layer links
  const metadata: Record<string, Metadata> = {};
  Object.entries(baseSchema).forEach(([key, constraint]) => {
    if (activeDataValues.includes(key) || formattedResult[key]) {
      const layerName = constraint["dmw-layer"];
      metadata[key] = {
        name: constraint.name,
        plural: constraint.name,
        dataset: layerName,
        text: `For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/${layerName}).`,
      };
    }
  });

  // If analytics are "on", store an audit record of the raw response
  if (extras?.analytics !== "false") {
    await $api.client.request(
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
        destination_url: activeDatasets.join(", "),
        response: { queryResults: queryResults.map((r) => r.result) },
        session_id: extras?.sessionId,
      },
    );
  }

  return {
    sourceRequest: activeDatasets.join(", "),
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
