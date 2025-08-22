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
      status: 400,
      message: "Missing required query params `lat` or `lon`",
    });

  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  // UK: https://spelunker.whosonfirst.org/id/85633159
  const UK_BBOX: number[] = [-8.649996, 49.864632, 1.768975, 60.860867];

  if (
    lat > UK_BBOX[3] ||
    lat < UK_BBOX[1] ||
    lon > UK_BBOX[2] ||
    lon < UK_BBOX[0]
  ) {
    return next({
      status: 400,
      message: "Latitude or longitude is out of UK bounding box",
    });
  }

  const params: Record<string, string> = {
    dataset: "local-planning-authority",
    geometry: `POINT(${req.query.lon} ${req.query.lat})`,
    geometry_relation: "intersects",
    exclude_field: "geometry",
  };

  // call Planning Data API's entity endpoint
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

        return data.entities;
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
