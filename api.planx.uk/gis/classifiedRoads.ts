import { Request, Response, NextFunction } from "express";

const PASSPORT_FN = "roads.classified";
const BUFFER_IN_METRES = 3;

export const classifiedRoadsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.query.geom)
      return next({ status: 401, message: "Missing required query param `?geom=`" });

    // buffer the site boundary

    // query OS Features WFS for classified roads (lines) that intersect with the buffered site boundary (polygon)

    // format the response to align with "planning constraints"
    return res.json({
      [PASSPORT_FN]: {
        value: true,
        text: "is on a Classified Road",
        data: [],
      }
    });
  } catch (error) {
    return next({ message: "Failed to fetch classified roads: " + (error as Error).message });
  }
};
