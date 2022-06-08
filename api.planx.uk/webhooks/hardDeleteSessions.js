const { subDays } = require("date-fns");
const { GraphQLClient } = require("graphql-request");

const hardDeleteSessions = async (_req, res, next) => {
  try {
    const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
      }
    });

    const mutation = `
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
    const { delete_lowcal_sessions } = await client.request(mutation, { oneWeekAgo });
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

module.exports = { hardDeleteSessions };