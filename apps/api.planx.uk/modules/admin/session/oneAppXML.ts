import type { NextFunction, Request, Response } from "express";

import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/index.js";

export const getOneAppXML = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const xml = await $api.export.oneAppPayload(req.params.sessionId);
    res.set("content-type", "text/xml");
    return res.send(xml);
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to get OneApp XML: " + (error as Error).message,
        cause: error,
      }),
    );
  }
};
