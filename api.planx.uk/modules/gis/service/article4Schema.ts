import type { NextFunction, Request, Response } from "express";

import { localAuthorityMetadata } from "./digitalLand.js";

/**
 * @swagger
 * /gis/{localAuthority}/article4-schema:
 *  get:
 *    summary: Returns whether Article 4 schema variables are configured for this local authority
 *    description: Returns whether Article 4 schema variables are configured for this local authority. A positive "status" from this endpoint is a proxy for marking this PlanX onboarding step "complete".
 *    tags:
 *      - gis
 *    parameters:
 *      - $ref: '#/components/parameters/localAuthority'
 *        description: Name of the Local Authority, usually the same as Planx `team`. Required until Planning Data is available for any council o article 4 variables are generalised based on permitted development rights removed rather than council
 */
export async function hasArticle4Schema(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.params.localAuthority) {
      return next({
        status: 401,
        message: "Missing param local authority",
      });
    }

    const status = Object.keys(localAuthorityMetadata).includes(
      req.params.localAuthority,
    );
    res.status(200).send({
      message: `${status ? "Found" : "Did not find"} Article 4 schema for ${req.params.localAuthority}`,
      status: status,
    });
  } catch (error) {
    next({
      status: 500,
      message: `Error getting Article 4 schema for ${req.params.localAuthority}: ${error}`,
    });
  }
}
