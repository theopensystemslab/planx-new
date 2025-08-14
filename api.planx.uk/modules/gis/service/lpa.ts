import type { NextFunction, Request, Response } from "express";
import fetch from "isomorphic-fetch";

export type LocalPlanningAuthorityFeature = {
  name: string;
  entity: number;
  reference: string;
  "organisation-entity": string;
};

/**
 * @swagger
 * /lpa:
 *  get:
 *    summary: Get LPAs at a given lat/lon
 *    description: Retrieves the Local Planning Authorities whose boundaries intersect a given point
 *    tags:
 *      - gis
 *    parameters:
 *      - in: query
 *        name: lat
 *        type: number
 *        required: true
 *        description: Latitude of the intersecting point
 *      - in: query
 *        name: lon
 *        type: number
 *        required: true
 *        description: Longitude of the intersecting point
 */
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

    return res.json({
      ...baseResponse,
      entities: entities,
    });
  } catch (error: any) {
    return next({
      message: "Failed to fetch: " + error?.message,
    });
  }
};
