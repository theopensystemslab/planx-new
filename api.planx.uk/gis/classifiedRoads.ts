import { NextFunction, Request, Response } from "express";
import fetch from "isomorphic-fetch";

type OSFeatures = {
  type: "FeatureCollection";
  crs: { 
    type: "name";
    properties: {
      name: "EPSG:4326"
    };
  };
  features: {
    type: "Feature";
    geometry: {
      type: string;
      coordinates: any[];
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

type PlanningConstraintResponse = {
  url?: string;
  constraints: Record<string, PlanningConstraintBody>;
  metadata?: Record<string, any>;
}

type PlanningConstraintBody = {
  value: boolean;
  text: string;
  data?: OSFeatures["features"];
  category?: string;
};

// Passport key comes from Digital Planning Schemas googlesheet
export const PASSPORT_FN = "road.classified";

export const classifiedRoadsSearch = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.query.usrn)
    return next({ status: 401, message: "Missing required query param `?usrn=`" });

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
    const url = `https://api.os.uk/features/v1/wfs?${new URLSearchParams(params).toString()}`;
    const features: OSFeatures["features"] = await fetch(url)
      .then((res: Response) => res.json())
      .then((data: OSFeatures) => {
        if (!data.features?.length) return;
        
        // Filter out any intersecting roads that are not classified
        //   find all possible values on page 43 https://www.ordnancesurvey.co.uk/documents/os-mastermap-highways-network-roads-technical-specification.pdf 
        //   XX in future consider doing this directly in XML using <ogc:PropertyIsNotEqualTo>
        const classifiedFeatures = data.features.filter((feature: OSFeatures["features"][0]) => !["Unclassified", "Not Classified", "Unknown"].includes(feature.properties["RoadClassification"]));
        return classifiedFeatures;
      });

    const baseResponse = {
      url: url.split("key=")[0],
      metadata: {
        [PASSPORT_FN]: {
          name: "Classified road",
          plural: "Classified roads",
        }
      }
    };

    if (features?.length) {
      return res.json({
        ...baseResponse,
        constraints: {
          [PASSPORT_FN]: {
            key: PASSPORT_FN,
            value: true,
            text: `is on a Classified Road (${features[0].properties["RoadName1"]} - ${features[0].properties["RoadClassification"]})`,
            data: features,
            category: "General policy",
          }
        }
      } as PlanningConstraintResponse)
    } else {
      return res.json({
        ...baseResponse,
        constraints: {
          [PASSPORT_FN]: {
            key: PASSPORT_FN,
            value: false,
            text: "is not on a Classified Road",
            category: "General policy",
          }
        }
      } as PlanningConstraintResponse)
    }
  } catch (error: any) {
    return next({ message: "Failed to fetch classified roads: " + error?.message });
  }
};
