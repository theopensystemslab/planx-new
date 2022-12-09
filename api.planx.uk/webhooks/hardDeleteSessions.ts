import { subDays } from "date-fns";
import { Request, Response, NextFunction } from "express";
import { gql } from "graphql-request";

import { Lowcal_Sessions } from "./../types";
import { adminGraphQLClient } from "../hasura";

/**
 * Called by Hasura cron job `delete_expired_sessions` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 */
const hardDeleteSessions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const mutation = gql`
      mutation HardDeleteExpiredSessions($oneWeekAgo: timestamptz) {
        delete_lowcal_sessions(
          where: {
            _or: [
              { deleted_at: { _lt: $oneWeekAgo } }
              { submitted_at: { _lt: $oneWeekAgo } }
            ]
          }
        ) {
          returning {
            id
          }
        }
      }
    `;
    const oneWeekAgo = subDays(new Date(), 7);
    const { delete_lowcal_sessions } = await adminGraphQLClient.request(
      mutation,
      { oneWeekAgo }
    );
    res.json({
      deletedSessions: delete_lowcal_sessions.returning.map(
        (session: Lowcal_Sessions) => session.id
      ),
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to delete sessions. ${(error as Error).message}`,
    });
  }
};

export { hardDeleteSessions };
