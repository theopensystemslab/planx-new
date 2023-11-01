import assert from "node:assert";
import { log } from "./globalHelpers";
import { sign } from "jsonwebtoken";
import { CoreDomainClient } from "@opensystemslab/planx-core";
import { GraphQLClient, gql } from "graphql-request";

export interface Context {
  user: {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    isPlatformAdmin: boolean;
  };
  team: {
    id?: number;
    name: string;
    slug: string;
    logo: string;
    primaryColor: string;
    homepage: string;
    submissionEmail: string;
  };
  flow?: {
    id?: string;
    publishedId?: number;
    slug: string;
    data?: object;
  };
  sessionIds?: string[];
}

export const contextDefaults: Context = {
  user: {
    firstName: "Test",
    lastName: "Test",
    email: "simulate-delivered@notifications.service.gov.uk",
    isPlatformAdmin: true,
  },
  team: {
    name: "E2E Test Team",
    slug: "E2E",
    logo: "https://raw.githubusercontent.com/theopensystemslab/planx-team-logos/main/planx-testing.svg",
    primaryColor: "#444444",
    homepage: "planx.uk",
    submissionEmail: "simulate-delivered@notifications.service.gov.uk",
  },
};

export async function setUpTestContext(
  initialContext: Context,
): Promise<Context> {
  const $admin = getCoreDomainClient();
  const context: Context = { ...initialContext };
  if (context.user) {
    context.user.id = await $admin.user.create(context.user);
  }
  if (context.team) {
    context.team.id = await $admin.team.create({
      slug: context.team.slug,
      name: context.team.name,
      logo: context.team.logo,
      primaryColor: context.team.primaryColor,
      homepage: context.team.homepage,
      submissionEmail: context.team.submissionEmail,
    });
  }
  if (
    context.flow?.slug &&
    context.flow?.data &&
    context.team?.id &&
    context.user?.id
  ) {
    context.flow.id = await $admin.flow.create({
      slug: context.flow.slug,
      teamId: context.team.id,
      data: context.flow!.data!,
    });
    context.flow.publishedId = await $admin.flow.publish({
      flow: {
        id: context.flow.id,
        data: context.flow!.data!,
      },
      publisherId: context.user!.id!,
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

export function generateAuthenticationToken(userId: string) {
  assert(process.env.JWT_SECRET);
  return sign(
    {
      sub: `${userId}`,
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["platformAdmin", "public"],
        "x-hasura-default-role": "platformAdmin",
        "x-hasura-user-id": `${userId}`,
      },
    },
    process.env.JWT_SECRET,
  );
}

export function getCoreDomainClient(): CoreDomainClient {
  assert(process.env.HASURA_GRAPHQL_URL);
  assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);

  const API = process.env.HASURA_GRAPHQL_URL!.replace(
    "${HASURA_PROXY_PORT}",
    process.env.HASURA_PROXY_PORT!,
  );
  const SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
  return new CoreDomainClient({
    auth: { adminSecret: SECRET },
    targetURL: API,
  });
}

export function getGraphQLClient(): GraphQLClient {
  return getCoreDomainClient().client;
}

export async function findSessionId(
  adminGQLClient: GraphQLClient,
  context,
): Promise<string | undefined> {
  // get the flow id which may have a session
  const flowResponse: { flows: { id: string }[] } =
    await adminGQLClient.request(
      `query GetFlowBySlug( $slug: String!) {
        flows(where: {slug: {_eq: $slug}}) {
          id
        }
      }`,
      { slug: context.flow?.slug },
    );
  if (!flowResponse.flows.length || !flowResponse.flows[0].id) {
    return;
  }
  const flowId = flowResponse.flows[0].id;
  // get the session id
  const response: { lowcal_sessions: { id: string }[] } =
    await adminGQLClient.request(
      gql`
        query GetSession($flowId: uuid!, $email: String!) {
          lowcal_sessions(
            where: { flow_id: { _eq: $flowId }, email: { _eq: $email } }
            order_by: { created_at: desc }
            limit: 1
          ) {
            id
          }
        }
      `,
      { flowId, email: context.user?.email },
    );
  if (response.lowcal_sessions.length && response.lowcal_sessions[0].id) {
    return response.lowcal_sessions[0].id;
  }
}

async function deleteSession(adminGQLClient: GraphQLClient, context) {
  if (context.sessionIds) {
    for (const sessionId of context.sessionIds) {
      await adminGQLClient.request(
        `mutation DeleteTestSession( $sessionId: uuid!) {
          delete_lowcal_sessions_by_pk(id: $sessionId) {
            id
          }
        }`,
        { sessionId },
      );
    }
  }
  const sessionId = await findSessionId(adminGQLClient, context);
  if (sessionId) {
    log(`deleting session id: ${sessionId}`);
    await adminGQLClient.request(
      `mutation DeleteTestSession( $sessionId: uuid!) {
        delete_lowcal_sessions_by_pk(id: $sessionId) {
          id
        }
      }`,
      { sessionId },
    );
  }
}

async function deletePublishedFlow(
  adminGQLClient: GraphQLClient,
  context: Context,
) {
  if (context.flow?.publishedId) {
    log(`deleting published flow ${context.flow?.publishedId}`);
    await adminGQLClient.request(
      `mutation DeleteTestPublishedFlow( $publishedFlowId: Int!) {
        delete_published_flows_by_pk(id: $publishedFlowId) {
          id
        }
      }`,
      { publishedFlowId: context.flow?.publishedId },
    );
  }
}

async function deleteFlow(adminGQLClient: GraphQLClient, context: Context) {
  if (context.flow?.id) {
    log(`deleting flow ${context.flow?.id}`);
    await adminGQLClient.request(
      `mutation DeleteTestFlow($flowId: uuid!) {
        delete_flows_by_pk(id: $flowId) {
          id
        }
      }`,
      { flowId: context.flow?.id },
    );
  } else if (context.flow?.slug) {
    // try deleting via slug (when cleaning up from a previously failed test)
    const response: { flows: { id: string }[] } = await adminGQLClient.request(
      `query GetFlowBySlug($slug: String!) {
        flows(where: {slug: {_eq: $slug}}) {
            id
          }
        }`,
      { slug: context.flow?.slug },
    );
    if (response.flows.length && response.flows[0].id) {
      log(
        `deleting flow ${context.flow?.slug} flowId: ${response.flows[0].id}`,
      );
      await adminGQLClient.request(
        `mutation DeleteTestFlow( $flowId: uuid!) {
          delete_flows_by_pk(id: $flowId) {
            id
          }
        }`,
        { flowId: response.flows[0].id },
      );
    }
  }
}

async function deleteUser(adminGQLClient: GraphQLClient, context: Context) {
  if (context.user?.id) {
    log(`deleting user ${context.user?.id}`);
    await adminGQLClient.request(
      `mutation DeleteTestUser($userId: Int!) {
        delete_users_by_pk(id: $userId) {
          id
        }
      }`,
      { userId: context.user?.id },
    );
  } else if (context.user?.email) {
    // try deleting via email (when cleaning up from a previously failed test)
    const response: { users: { id: number }[] } = await adminGQLClient.request(
      `query GetUserByEmail($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
        }
      }`,
      { email: context.user?.email },
    );
    if (response.users.length && response.users[0].id) {
      log(
        `deleting user ${context.user?.email} userId: ${response.users[0].id}`,
      );
      await adminGQLClient.request(
        `mutation DeleteTestUser($userId: Int!) {
          delete_users_by_pk(id: $userId) {
            id
          }
        }`,
        { userId: response.users[0].id },
      );
    }
  }
}

async function deleteTeam(adminGQLClient: GraphQLClient, context: Context) {
  if (context.team?.id) {
    log(`deleting team ${context.team?.id}`);
    await adminGQLClient.request(
      `mutation DeleteTestTeam( $teamId: Int!) {
        delete_teams_by_pk(id: $teamId) {
          id
        }
      }`,
      { teamId: context.team?.id },
    );
  } else if (context.team?.slug) {
    // try deleting via slug (when cleaning up from a previously failed test)
    const response: { teams: { id: number }[] } = await adminGQLClient.request(
      `query GetTeamBySlug( $slug: String!) {
           teams(where: {slug: {_eq: $slug}}) {
               id
             }
           }`,
      { slug: context.team?.slug },
    );
    if (response.teams.length && response.teams[0].id) {
      log(
        `deleting team ${context.team?.slug} teamId: ${response.teams[0].id}`,
      );
      await adminGQLClient.request(
        `mutation DeleteTestTeam( $teamId: Int!) {
        delete_teams_by_pk(id: $teamId) {
          id
        }
      }`,
        { teamId: response.teams[0].id },
      );
    }
  }
}
