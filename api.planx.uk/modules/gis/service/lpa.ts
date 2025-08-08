import type { NextFunction, Request, Response } from "express";
import fetch from "isomorphic-fetch";

type LocalPlanningAuthorityFeature = {
  name: string;
  entity: number;
  reference: string;
  "organisation-entity": string;
};

// assuming there's a more robust way to do this
// .. but for the sake of a working example
const lpaReferenceLookup: Record<string, string> = {
  E60000203: "barnet",
  E60000331: "buckinghamshire",
  E60000188: "camden",
  E60000065: "doncaster",
  E60000271: "epsom-and-ewell",
  E60000008: "gateshead",
  E60000311: "gloucester",
  E60000195: "lambeth",
  E60000224: "medway",
  E60000009: "newcastle",
  E60000198: "southwark",
  E60000171: "st-albans",
  E60000313: "tewkesbury",
  E60000230: "west-berkshire",
};

export const localPlanningAuthorityLookup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.query.lat || !req.query.lon)
    return next({
      status: 401,
      message: "Missing required query params `lat` or `lon`",
    });

  const params: Record<string, string> = {
    dataset: "local-planning-authority",
    geometry: `POINT(${req.query.lon} ${req.query.lat})`,
    geometry_relation: "intersects",
    exclude_field: "geometry",
  };

  // call Planning Data API
  // https://www.planning.data.gov.uk/docs
  try {
    const url = `https://www.planning.data.gov.uk/entity.json?${new URLSearchParams(
      params,
    ).toString()}`;

    console.log(url);

    const entities: LocalPlanningAuthorityFeature[] = await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.entities?.length) {
          return [];
        }

        return data.entities as LocalPlanningAuthorityFeature[];
      });

    const baseResponse = {
      sourceRequest: url.split("dataset=")[0],
    };

    let matchingLpa: string | null = null;

    // sometimes there are multiple intersecting LPAs
    // do we need more sophisticated match logic here?
    for (const entity of entities) {
      if (Object.keys(lpaReferenceLookup).indexOf(entity.reference) > -1) {
        matchingLpa = lpaReferenceLookup[entity.reference];
      }
    }

    return res.json({
      ...baseResponse,
      entities: entities,
      matchingLpa: matchingLpa,
    });
  } catch (error: any) {
    return next({
      message: "Failed to fetch: " + error?.message,
    });
  }
};
