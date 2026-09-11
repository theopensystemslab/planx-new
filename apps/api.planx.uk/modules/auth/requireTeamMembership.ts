import type { NextFunction, Request, Response } from "express";

import { $api } from "../../client/index.js";
import { ServerError } from "../../errors/index.js";
import { userContext } from "./middleware.js";

/**
 * Confirm that the current user can edit the given team - a teamEditor/teamAdmin of that team, or a platformAdmin
 * Shared business logic behind `requireTeamMembership` and `../stripe/middleware.ts`->`requireStripeConnectTeamAuth`
 *
 * `teamLabel` is only used in the rejection message, defaults to team id but can be customised if the caller has it
 */
export const assertTeamEditPermission = async (
  teamId: number,
  teamLabel: string | number = teamId,
): Promise<void> => {
  const userId = userContext.getStore()?.user?.sub;
  if (!userId) {
    throw new ServerError({
      status: 403,
      message: "Access denied - userId missing from request",
    });
  }

  const user = await $api.user.getById(Number(userId));
  if (!user) {
    throw new ServerError({
      status: 403,
      message: `Access denied - unable to find user matching ID ${userId}`,
    });
  }

  const isUserInTeam = user.teams.some(
    ({ team, role }) =>
      team.id === teamId && (role === "teamEditor" || role === "teamAdmin"),
  );

  if (!user.isPlatformAdmin && !isUserInTeam) {
    throw new ServerError({
      status: 403,
      message: `Access denied. User ${userId} is not a member of team ${teamLabel} with permission to edit it`,
    });
  }
};

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
    try {
      const teamId = getTeamId(res.locals.parsedReq as T);
      await assertTeamEditPermission(teamId);
      return next();
    } catch (error) {
      return next(error);
    }
  };
