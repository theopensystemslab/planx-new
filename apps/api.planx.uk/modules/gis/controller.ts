import { getValidSchemaValues } from "@opensystemslab/planx-core";

import { ServerError } from "../../errors/serverError.js";
import { findLpa } from "./service/findLpa/index.js";
import type { FindLpaRequest } from "./service/findLpa/types.ts";
import type { GetPlanningConstraintsSchemaRequest } from "./service/getPlanningConstraintsSchema/types.js";

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

export const getPlanningConstraintsSchemaController: GetPlanningConstraintsSchemaRequest = async (_req, res, next) => {
  const { localAuthority } = res.locals.parsedReq.query;

  try {
    const baseSchema = getValidSchemaValues("PlanningDesignation");
    // TODO merge in granular a4s for applicable localAuthorities
    
    return res.status(200).json(baseSchema);
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to get planning constraints schema (${localAuthority}). ${(error as Error).message}`,
      }),
    );
  }
};
