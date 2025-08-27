import { ServerError } from "../../../errors/serverError.js";
import type { FindLpaRequest } from "../service/findLpa/types.js";

export const validateFindLpa: FindLpaRequest = async (_req, res, next) => {
  const { lon, lat } = res.locals.parsedReq.query;

  try {
    if (!lon || !lat)
      return next({
        status: 400,
        message: "Missing required query params `lat` or `lon`",
      });

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

    return next();
  } catch (error) {
    return next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to look up local planning authority.`,
      }),
    );
  }
};
