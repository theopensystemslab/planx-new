import { sign } from "jsonwebtoken";
import Axios from "axios";

export const gqlAdmin = async (query, variables = {}) => {
  const HASURA_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
  const HASURA_PROXY_PORT = process.env.HASURA_PROXY_PORT;

  const response = await Axios(
    `http://localhost:${HASURA_PROXY_PORT}/v1/graphql`,
    {
      method: "POST",
      headers: {
        "X-Hasura-Admin-Secret": HASURA_GRAPHQL_ADMIN_SECRET,
      },
      data: { query, variables },
    },
  );
  const { data: json } = response;

  if (json.errors) {
    if (json.errors[0].message.includes("x-hasura-admin-secret"))
      throw Error("Invalid HASURA_SECRET");
    else console.error(json);
  }
  return json;
};

export const getJWT = (userId) => {
  const data = {
    sub: String(userId),
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["admin"],
      "x-hasura-default-role": "admin",
      "x-hasura-user-id": String(userId),
    },
  };

  return sign(data, process.env.JWT_SECRET);
};

export const insertTeam = async (teamName) => {
  return gqlAdmin(`
      mutation {
        delete_teams(where: {slug: {_eq: "${teamName}"}}) {
          affected_rows
        }
        insert_teams(objects: {name: "${teamName}", slug: "${teamName}"}) {
          returning { id }
        }
      }
    `).then((response) => {
    const {
      data: {
        insert_teams: {
          returning: [{ id: teamId }],
        },
      },
    } = response;

    return teamId;
  });
};

export const insertTestUser = async (userEmail: string) => {
  return gqlAdmin(`
    mutation {
      delete_users(where: {email: {_eq: "${userEmail}"}}) {
        affected_rows
      }
      insert_users(objects: {first_name: "test", last_name: "test", email: "${userEmail}", id: 1}) {
        returning { id }
      }
    }
  `).then((response) => {
    const {
      data: {
        insert_users: {
          returning: [{ id: userId }],
        },
      },
    } = response;

    return userId;
  });
};

export const cleanAnalytics = async () => {
  return gqlAdmin(`
    mutation {
      delete_analytics_logs(where: {}) {
        affected_rows
      }
      delete_analytics(where: {}) {
        affected_rows
      }
    }
  `);
};

export const deleteUsers = async (userIds: number[] = []) => {
  return gqlAdmin(`
    mutation {
      delete_operations(where: {actor_id: {_in: ${JSON.stringify(userIds)}}}) {
        affected_rows
      }
      delete_users(where: {id: {_in: ${JSON.stringify(userIds)}}}) {
        affected_rows
      }
    }
  `);
};

export const deleteFlowsByTeamIdsAndSlugs = async (
  teamIds: number[] = [],
  flowSlugs: string[] = [],
) => {
  return gqlAdmin(`
    mutation {
      delete_flows(where: {
        team_id: {_in: ${JSON.stringify(teamIds)}}, 
        slug: {_in: ${JSON.stringify(flowSlugs)}}
      }) {
        affected_rows
      }
    }
  `);
};

export const deleteTeams = async (teamIds: number[] = []) => {
  return gqlAdmin(`
    mutation {
      delete_teams(where: {id: {_in: ${JSON.stringify(teamIds)}}}) {
        affected_rows
      }
    }
  `);
};
