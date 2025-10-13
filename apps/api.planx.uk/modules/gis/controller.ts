import { ServerError } from "../../errors/serverError.js";
import { findLpa } from "./service/findLpa/index.js";
import type { FindLpaRequest } from "./service/findLpa/types.ts";

export const findLpaController: FindLpaRequest = async (_req, res, next) => {
  const { lon, lat } = res.locals.parsedReq.query;

  try {
    const findLpaResults = await findLpa(lon, lat);
    return res.status(200).json(findLpaResults);
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to find local planning authority. ${(error as Error).message}`,
      }),
    );
  }
};
