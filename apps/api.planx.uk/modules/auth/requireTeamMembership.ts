import type { NextFunction, Request, Response } from "express";

import { $api } from "../../client/index.js";
import { userContext } from "./middleware.js";

/**
 * Authorise that the current user can edit the team targeted by a request
 *
 * `useRoleAuth` only checks the user's global role claim, leaving per-team
 * authorisation to Hasura's row-level check (are they a teamEditor within *this* team?).
 * Routes that mutate via the `api` role (which has no row-level check) lose that
 * enforcement, so this middleware refills the permission check in the API layer.
 *
 * This middleware should be used sparingly - only when it's not possible to rely on
 * Hasura row-level checks (e.g. to skip redundant and memory intensive input validation
 * for template INSERT actions)
 */
export const requireTeamMembership =
  <T>(getTeamId: (parsedReq: T) => number) =>
  async (_req: Request, res: Response, next: NextFunction) => {
    const userId = userContext.getStore()?.user?.sub;
    if (!userId)
      return next({
        status: 403,
        message: "Access denied - userId missing from request",
      });

    const teamId = getTeamId(res.locals.parsedReq as T);

    const user = await $api.user.getById(Number(userId));
    if (!user)
      return next({
        status: 403,
        message: `Access denied - unable to find user matching ID ${userId}`,
      });

    const isUserInTeam = user.teams.some(
      ({ team, role }) =>
        team.id === teamId && (role === "teamEditor" || role === "teamAdmin"),
    );

    const isAuthorised = user.isPlatformAdmin || isUserInTeam;

    if (!isAuthorised) {
      return next({
        status: 403,
        message: `Access denied. User ${userId} is not a member of team ${teamId} with permission to edit it`,
      });
    }

    return next();
  };
