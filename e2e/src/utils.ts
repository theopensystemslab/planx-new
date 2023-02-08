import { sign } from "jsonwebtoken";
import { GraphQLClient } from "graphql-request";

const HASURA_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
const HASURA_PROXY_PORT = process.env.HASURA_PROXY_PORT;

const prodClient = new GraphQLClient(
  "https://hasura.editor.planx.dev/v1/graphql"
);
const localClient = new GraphQLClient(
  `http://localhost:${HASURA_PROXY_PORT}/v1/graphql`,
  {
    headers: {
      "X-Hasura-Admin-Secret": HASURA_GRAPHQL_ADMIN_SECRET!,
    },
  }
);

export const prodGqlPublic = async (query: string, variables = {}) => {
  const data = await prodClient.request(query, variables);

  if (data.errors) {
    if (data.errors[0].message.includes("x-hasura-admin-secret"))
      throw Error("Invalid HASURA_SECRET");
    else console.error(data);
  }
  return data;
};

export const gqlAdmin = async (query, variables = {}) => {
  const data = await localClient.request(query, variables);

  if (data.errors) {
    if (data.errors[0].message.includes("x-hasura-admin-secret"))
      throw Error("Invalid HASURA_SECRET");
    else console.error(data);
  }
  return { data };
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
  flowSlugs: string[] = []
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

export async function createFlow({
  teamId,
  flowSlug,
}: {
  teamId: number;
  flowSlug: string;
}) {
  const {
    data: { insert_flows_one },
  } = await gqlAdmin(
    `
      mutation CreateFlow($teamId: Int!, $flowSlug: String!) {
        insert_flows_one(object: { team_id: $teamId, slug: $flowSlug }) {
          id
        }
      }
    `,
    {
      teamId: teamId,
      flowSlug: flowSlug,
    }
  );

  return insert_flows_one.id;
}

export async function createTeam(slug: string) {
  const {
    data: { insert_teams_one },
  } = await gqlAdmin(
    `
      mutation CreateTeam ($slug: String!) {
        insert_teams_one(object: { name: $slug, slug: $slug }) {
          id
        }
      }
    `,
    {
      slug: slug,
    }
  );
  return insert_teams_one.id;
}

export async function getAnalyticsByFlowId(flowId: string): Promise<number[]> {
  const {
    data: { analytics },
  } = await gqlAdmin(
    `
      query Analytics($flowIds: [uuid!]!) {
      analytics(where: { flow_id: { _in: $flowIds } }) {
          id
        }
      }
    `,
    {
      flowIds: [flowId],
    }
  );

  return analytics?.map(({ id }) => id) || [];
}

export async function insertPublishedFlow({
  publishedFlow,
}: {
  publishedFlow: Record<string, any>;
}) {
  const {
    data: { insert_published_flows_one },
  } = await gqlAdmin(
    `
      mutation InsertPublishedFlow(
        $publishedFlow: published_flows_insert_input!,
      ) {
        insert_published_flows_one(
          object: $publishedFlow
        ) {
          id
        }
      }
    `,
    {
      publishedFlow,
    }
  );

  return insert_published_flows_one.id;
}

export async function deleteTestData({
  teamId,
  flowId,
  publishedFlowId,
  userId,
  analyticsIds,
}: {
  teamId: number;
  flowId: string;
  publishedFlowId: string;
  userId: number;
  analyticsIds: number[];
}) {
  await gqlAdmin(
    `
      mutation DeleteTestRegisters(
        $teams: [Int!]!,
        $flows: [uuid!]!,
        $publishedFlows: [Int!]!,
        $userIds: [Int!]!,
        $analyticsIds: [bigint!]!
      ) {
        delete_analytics_logs(where: { analytics_id: { _in: $analyticsIds } }) {
          affected_rows
        }
        delete_analytics(where: { id: { _in: $analyticsIds } }) {
          affected_rows
        }
        delete_session_backups(where: { flow_id: { _in: $flows } }){
          affected_rows
        }
        delete_published_flows(where: { id: { _in: $publishedFlows } }) {
          affected_rows
        }
        delete_flows(where: { id: { _in: $flows } }) {
          affected_rows
        }
        delete_teams(where: { id: { _in: $teams } }) {
          affected_rows
        }
        delete_users(where: { id: { _in: $userIds } }) {
          affected_rows
        }
      }
    `,
    {
      teams: [teamId],
      flows: [flowId],
      publishedFlows: [publishedFlowId],
      userIds: [userId],
      analyticsIds: analyticsIds,
    }
  );
}
