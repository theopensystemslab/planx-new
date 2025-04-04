import {
  activePlanningConstraints,
  type Constraint,
  type GISResponse,
} from "@opensystemslab/planx-core/types";
import type { NextFunction, Request, Response } from "express";
import fetch from "isomorphic-fetch";

type OSFeatures = {
  type: "FeatureCollection";
  crs: {
    type: "name";
    properties: {
      name: "EPSG:4326";
    };
  };
  features: {
    type: "Feature";
    geometry: {
      type: string;
      coordinates: number[];
    };
    properties: OSHighwayFeature;
  }[];
};

// this is a meaningful subset of all properties returned, see nock for full sample response object
type OSHighwayFeature = {
  OBJECTID: number;
  Identifier: string;
  RoadClassification: string;
  RoadName1: string;
  FormsPartOf: string;
};

interface RoadConstraint extends Constraint {
  data?: OSFeatures["features"];
}

// Passport key comes from Digital Planning Schemas googlesheet
export const PASSPORT_FN = "road.classified";

/**
 * @swagger
 * /roads:
 *  get:
 *    summary: Fetches road classifications
 *    description: Fetches and formats road classifications from Ordnance Survey MasterMap Highways via OS Features API for a USRN
 *    tags:
 *      - gis
 *    parameters:
 *      - in: query
 *        name: usrn
 *        type: string
 *        required: true
 *        description: Unique Street Reference Number (USRN)
 */
export const classifiedRoadsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.query.usrn)
    return next({
      status: 401,
      message: "Missing required query param `?usrn=`",
    });

  // Create an OGC XML filter parameter value which will select the road features (lines) that match an USRN
  //   ref https://labs.os.uk/public/os-data-hub-examples/os-features-api/wfs-example-topo-toid-search#maplibre-gl-js
  const xml = `
    <ogc:Filter>
      <ogc:PropertyIsLike wildCard="%" singleChar="#" escapeChar="!">
        <ogc:PropertyName>FormsPartOf</ogc:PropertyName>
        <ogc:Literal>%Street#usrn${req.query.usrn}%</ogc:Literal>
      </ogc:PropertyIsLike>
    </ogc:Filter>
  `;

  // Define WFS parameters object
  const params: Record<string, string> = {
    service: "WFS",
    request: "GetFeature",
    version: "2.0.0",
    typeNames: "Highways_RoadLink", // sourced from OS MasterMap Highways Network, uniquely includes "RoadClassification" attribute
    outputFormat: "GEOJSON",
    srsName: "urn:ogc:def:crs:EPSG::4326",
    count: "1", // USRN can match many road segments, but all should share the same classification, so limit to first result
    filter: xml,
    key: process.env.ORDNANCE_SURVEY_API_KEY || "",
  };

  try {
    const url = `https://api.os.uk/features/v1/wfs?${new URLSearchParams(
      params,
    ).toString()}`;
    const features = await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.features?.length) return;

        // Filter out any intersecting roads that are not classified
        //   find all possible values on page 43 https://www.ordnancesurvey.co.uk/documents/os-mastermap-highways-network-roads-technical-specification.pdf
        //   XX in future consider doing this directly in XML using <ogc:PropertyIsNotEqualTo>
        const classifiedFeatures = data.features.filter(
          (feature: OSFeatures["features"][0]) =>
            !["Unclassified", "Not Classified", "Unknown"].includes(
              feature.properties["RoadClassification"],
            ),
        );
        return classifiedFeatures;
      });

    const baseResponse = {
      sourceRequest: url.split("key=")[0],
      metadata: {
        [PASSPORT_FN]: {
          name: "Classified road",
          plural: "Classified roads",
          text: "This will effect your project if you are looking to add a dropped kerb. It may also impact some agricultural or forestry projects within 25 metres of a classified road.",
        },
      },
    };

    if (features?.length) {
      return res.json({
        ...baseResponse,
        constraints: {
          [PASSPORT_FN]: {
            fn: PASSPORT_FN,
            value: true,
            text: activePlanningConstraints[PASSPORT_FN].pos,
            data: features.map((feature: any) => ({
              name: `${feature.properties["RoadName1"]} - ${feature.properties["RoadClassification"]}`,
              entity: feature.properties["GmlID"], // match Planning Data "entity" identifier for convenience when reporting inaccurate constraints
              properties: feature.properties,
            })),
            category: activePlanningConstraints[PASSPORT_FN].category,
          } as RoadConstraint,
        },
      } as GISResponse);
    } else {
      return res.json({
        ...baseResponse,
        constraints: {
          [PASSPORT_FN]: {
            fn: PASSPORT_FN,
            value: false,
            text: activePlanningConstraints[PASSPORT_FN].neg,
            category: activePlanningConstraints[PASSPORT_FN].category,
          } as RoadConstraint,
        },
      } as GISResponse);
    }
  } catch (error: any) {
    return next({
      message: "Failed to fetch classified roads: " + error?.message,
    });
  }
};
