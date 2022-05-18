const { GraphQLClient } = require("graphql-request");

const hardDeleteSessions = async (_req, res, next) => {
  try {
    const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
      }
    });

    const mutation = `
      mutation HardDeleteExpiredSessions {
        delete_lowcal_sessions(where: { deleted_at: { _is_null: false } }) {
          returning {
            id
          }
        }
      }
    `
    const { delete_lowcal_sessions } = await client.request(mutation);
    res.json({
      deletedSessions: delete_lowcal_sessions.returning.map(session => session.id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { hardDeleteSessions };