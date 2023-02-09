import assert from "node:assert";
import { log } from "./helpers";
import { sign } from "jsonwebtoken";
import { Client } from "planx-client";
import { GraphQLClient } from "graphql-request";

export interface Context {
  user?: {
    id: string;
  };
  team?: {
    id: string;
  };
  flow?: {
    id: string;
    publishedFlowId?: number;
  };
}

export async function setUpTestContext(
  client: Client,
  initialContext: {
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    team?: {
      name: string;
      slug?: string;
      logo: string;
      primaryColor: string;
      homepage: string;
    };
    flow?: {
      slug: string;
      data?: object;
    };
  }
): Promise<Context> {
  const context: any = initialContext;
  if (context.user) {
    context.user.id = await client.createUser(context.user);
  }
  if (context.team) {
    context.team.id = await client.createTeam(context.team);
  }
  if (context.flow?.slug && context.team?.id) {
    context.flow.id = await client.createFlow({
      slug: context.flow.slug,
      teamId: context.team.id,
      data: context.flow.data,
    });
    context.flow.publishedId = await client.publishFlow({
      flow: context.flow,
      publisherId: context.user.id,
    });
  }
  return context;
}

export async function tearDownTestContext(context: Context) {
  const adminGQLClient = getGraphQLClient();
  if (context.flow) {
    await deleteSession(adminGQLClient, context);
    await deletePublishedFlow(adminGQLClient, context);
    await deleteFlow(adminGQLClient, context);
  }
  if (context.user) {
    await deleteUser(adminGQLClient, context);
  }
  if (context.team) {
    await deleteTeam(adminGQLClient, context);
  }
}

export function generateAuthenticationToken(userId) {
  assert(process.env.JWT_SECRET);
  return sign(
    {
      sub: `${userId}`,
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["admin"],
        "x-hasura-default-role": "admin",
        "x-hasura-user-id": `${userId}`,
      },
    },
    process.env.JWT_SECRET
  );
}

export function getClient(): Client {
  assert(process.env.HASURA_GRAPHQL_URL);
  assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);

  const API = process.env.HASURA_GRAPHQL_URL!.replace(
    "${HASURA_PROXY_PORT}",
    process.env.HASURA_PROXY_PORT!
  );
  const SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
  return new Client({
    hasuraSecret: SECRET,
    targetURL: API,
  });
}

// used for teardown only
export function getGraphQLClient(): GraphQLClient {
  const API = process.env.HASURA_GRAPHQL_URL!.replace(
    "${HASURA_PROXY_PORT}",
    process.env.HASURA_PROXY_PORT!
  );
  const SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
  return new GraphQLClient(API, {
    headers: { "X-Hasura-Admin-Secret": SECRET },
  });
}

export async function findSessionId(
  admingGQLClient: GraphQLClient,
  context
): Promise<string | undefined> {
  // get the flow id which may have a session
  const { flows: flowResponse } = await admingGQLClient.request(
    `query GetFlowBySlug( $slug: String!) {
        flows(where: {slug: {_eq: $slug}}) {
          id
        }
      }`,
    { slug: context.flow?.slug }
  );
  if (!flowResponse.length || !flowResponse[0].id) {
    return;
  }
  const flowId = flowResponse[0].id;
  // get the session id
  const { lowcal_sessions: response } = await admingGQLClient.request(
    `query GetSession( $flowId: uuid!, $email: String!) {
        lowcal_sessions(where: {flow_id: {_eq: $flowId}, email: {_eq: $email}}) {
          id
        }
      }`,
    { flowId, email: context.user?.email }
  );
  if (response.length && response[0].id) {
    return response[0].id;
  }
}

async function deleteSession(admingGQLClient: GraphQLClient, context) {
  const sessionId = await findSessionId(admingGQLClient, context);
  if (sessionId) {
    log(`deleting session id: ${sessionId}`);
    await admingGQLClient.request(
      `mutation DeleteTestSession( $sessionId: uuid!) {
        delete_lowcal_sessions_by_pk(id: $sessionId) {
          id
        }
      }`,
      { sessionId: sessionId }
    );
  }
}

async function deletePublishedFlow(
  admingGQLClient: GraphQLClient,
  context: Context
) {
  if (context.flow?.publishedFlowId) {
    log(`deleting published flow ${context.flow?.publishedFlowId}`);
    await admingGQLClient.request(
      `mutation DeleteTestPublishedFlow( $publishedFlowId: Int!) {
        delete_published_flows_by_pk(id: $publishedFlowId) {
          id
        }
      }`,
      { publishedFlowId: context.flow?.publishedFlowId }
    );
  }
}

async function deleteFlow(admingGQLClient: GraphQLClient, context: Context) {
  if (context.flow?.id) {
    log(`deleting flow ${context.flow?.id}`);
    await admingGQLClient.request(
      `mutation DeleteTestFlow($flowId: uuid!) {
        delete_flows_by_pk(id: $flowId) {
          id
        }
      }`,
      { flowId: context.flow?.id }
    );
  } else if (context.flow?.slug) {
    // try deleting via slug (when cleaning up from a previously failed test)
    const { flows: response } = await admingGQLClient.request(
      `query GetFlowBySlug($slug: String!) {
        flows(where: {slug: {_eq: $slug}}) {
            id
          }
        }`,
      { slug: context.flow?.slug }
    );
    if (response.length && response[0].id) {
      log(`deleting flow ${context.flow?.slug} flowId: ${response[0].id}`);
      await admingGQLClient.request(
        `mutation DeleteTestFlow( $flowId: uuid!) {
          delete_flows_by_pk(id: $flowId) {
            id
          }
        }`,
        { flowId: response[0].id }
      );
    }
  }
}

async function deleteUser(admingGQLClient: GraphQLClient, context: Context) {
  if (context.user?.id) {
    log(`deleting user ${context.user?.id}`);
    await admingGQLClient.request(
      `mutation DeleteTestUser($userId: Int!) {
        delete_users_by_pk(id: $userId) {
          id
        }
      }`,
      { userId: context.user?.id }
    );
  } else if (context.user?.email) {
    // try deleting via email (when cleaning up from a previously failed test)
    const { users: response } = await admingGQLClient.request(
      `query GetUserByEmail($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
        }
      }`,
      { email: context.user?.email }
    );
    if (response.length && response[0].id) {
      log(`deleting user ${context.user?.email} userId: ${response[0].id}`);
      await admingGQLClient.request(
        `mutation DeleteTestUser($userId: Int!) {
          delete_users_by_pk(id: $userId) {
            id
          }
        }`,
        { userId: response[0].id }
      );
    }
  }
}

async function deleteTeam(admingGQLClient: GraphQLClient, context: Context) {
  if (context.team?.id) {
    log(`deleting team ${context.team?.id}`);
    await admingGQLClient.request(
      `mutation DeleteTestTeam( $teamId: Int!) {
        delete_teams_by_pk(id: $teamId) {
          id
        }
      }`,
      { teamId: context.team?.id }
    );
  } else if (context.team?.slug) {
    // try deleting via slug (when cleaning up from a previously failed test)
    const { teams: response } = await admingGQLClient.request(
      `query GetTeamBySlug( $slug: String!) {
           teams(where: {slug: {_eq: $slug}}) {
               id
             }
           }`,
      { slug: context.team?.slug }
    );
    if (response.length && response[0].id) {
      log(`deleting team ${context.team?.slug} teamId: ${response[0].id}`);
      await admingGQLClient.request(
        `mutation DeleteTestTeam( $teamId: Int!) {
        delete_teams_by_pk(id: $teamId) {
          id
        }
      }`,
        { teamId: response[0].id }
      );
    }
  }
}
