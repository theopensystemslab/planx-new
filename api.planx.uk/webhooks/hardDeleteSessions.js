const { subDays } = require("date-fns");
const { gql } = require("graphql-request");
const { adminGraphQLClient } = require("../hasura");

const hardDeleteSessions = async (_req, res, next) => {
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
    `
    const oneWeekAgo = subDays(new Date(), 7);
    const { delete_lowcal_sessions } = await adminGraphQLClient.request(mutation, { oneWeekAgo });
    res.json({
      deletedSessions: delete_lowcal_sessions.returning.map(session => session.id),
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to delete sessions. ${error.message}`
    });
  };
};

export { hardDeleteSessions };