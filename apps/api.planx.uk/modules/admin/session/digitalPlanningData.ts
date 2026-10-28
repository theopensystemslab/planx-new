import type { NextFunction, Request, Response } from "express";

import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/index.js";

export const getDigitalPlanningApplicationPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let skipValidation = false;
    if (req.query?.skipValidation) {
      skipValidation =
        (req.query.skipValidation as string).toLowerCase() === "true";
    }

    const data = await $api.export.digitalPlanningDataPayload(
      req.params.sessionId,
      skipValidation,
    );

    res.set("content-type", "application/json");
    return res.send(data);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to make Digital Planning Application payload: ${error}. Stack: ${(error as Error).stack}`,
        cause: error,
      }),
    );
  }
};
