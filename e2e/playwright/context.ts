import Client from "planx-client";

const log = process.env.DEBUG
  ? console.log
  : () => {
      // silent
    };

export async function setUpTestContext(
  client: Client,
  initialContext: InitialContext
): Promise<Context> {
  const context: any = initialContext;
  context.user.id = await client.createUser(context.user);
  context.team.id = await client.createTeam(context.team);
  context.flow.id = await client.createFlow({
    slug: context.flow.slug,
    teamId: context.team.id,
    data: context.flow.data,
  });
  context.flow.publishedId = await client.publishFlow({
    flow: context.flow,
    publisherId: context.user.id,
  });
  return context;
}

export async function findSessionId(
  client: Client,
  context: Context
): Promise<string | undefined> {
  // get the flow id which may have a session
  const { flows: flowResponse } = await client.request(
    `query GetFlowBySlug( $slug: String!) {
        flows(where: {slug: {_eq: $slug}}) {
          id
        }
      }`,
    { slug: context.flow.slug }
  );
  if (!flowResponse.length || !flowResponse[0].id) {
    return;
  }
  const flowId = flowResponse[0].id;
  // get the session id
  const { lowcal_sessions: response } = await client.request(
    `query GetSession( $flowId: uuid!, $email: String!) {
        lowcal_sessions(where: {flow_id: {_eq: $flowId}, email: {_eq: $email}}) {
          id
        }
      }`,
    { flowId, email: context.user.email }
  );
  if (response.length && response[0].id) {
    return response[0].id;
  }
}

export async function tearDownTestContext(client: Client, context: Context) {
  await deleteSession(client, context);
  await deletePublishedFlow(client, context);
  await deleteFlow(client, context);
  await deleteUser(client, context);
  await deleteTeam(client, context);
}

async function deleteSession(client: Client, context: Context) {
  const sessionId = await findSessionId(client, context);
  if (sessionId) {
    log(`deleting session id: ${sessionId}`);
    await client.request(
      `mutation DeleteTestSession( $sessionId: uuid!) {
        delete_lowcal_sessions_by_pk(id: $sessionId) {
          id
        }
      }`,
      { sessionId: sessionId }
    );
  }
}

async function deletePublishedFlow(client: Client, context: Context) {
  const { published_flows: response } = await client.request(
    `query GetPublishedFlowBySlug( $slug: String!) {
        published_flows(where: {flow: {slug: {_eq: $slug}}}) {
          id
        }
      }`,
    { slug: context.flow.slug }
  );
  if (response.length && response[0].id) {
    log(
      `deleting flow ${context.flow.slug} publishedFlowId: ${response[0].id}`
    );
    await client.request(
      `mutation DeleteTestPublishedFlow( $publishedFlowId: Int!) {
        delete_published_flows_by_pk(id: $publishedFlowId) {
          id
        }
      }`,
      { publishedFlowId: response[0].id }
    );
  }
}

async function deleteFlow(client: Client, context: Context) {
  const { flows: response } = await client.request(
    `query GetFlowBySlug( $slug: String!) {
        flows(where: {slug: {_eq: $slug}}) {
          id
        }
      }`,
    { slug: context.flow.slug }
  );
  if (response.length && response[0].id) {
    log(`deleting flow ${context.flow.slug} flowId: ${response[0].id}`);
    await client.request(
      `mutation DeleteTestFlow( $flowId: uuid!) {
        delete_flows_by_pk(id: $flowId) {
          id
        }
      }`,
      { flowId: response[0].id }
    );
  }
}

async function deleteUser(client: Client, context: Context) {
  const { users: response } = await client.request(
    `query GetUserByEmail( $email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
        }
      }`,
    { email: context.user.email }
  );
  if (response.length && response[0].id) {
    log(`deleting user ${context.user.email} userId: ${response[0].id}`);
    await client.request(
      `mutation DeleteTestUser( $userId: Int!) {
        delete_users_by_pk(id: $userId) {
          id
        }
      }`,
      { userId: response[0].id }
    );
  }
}

async function deleteTeam(client: Client, context: Context) {
  const { teams: response } = await client.request(
    `query GetTeamBySlug( $slug: String!) {
        teams(where: {slug: {_eq: $slug}}) {
          id
        }
      }`,
    { slug: context.team.slug }
  );
  if (response.length && response[0].id) {
    log(`deleting team ${context.team.slug} teamId: ${response[0].id}`);
    await client.request(
      `mutation DeleteTestTeam( $teamId: Int!) {
        delete_teams_by_pk(id: $teamId) {
          id
        }
      }`,
      { teamId: response[0].id }
    );
  }
}

export interface InitialContext {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  team: {
    name: string;
    slug?: string;
    logo: string;
    primaryColor: string;
    homepage: string;
  };
  flow: {
    slug: string;
    data?: object;
  };
}

export interface Context {
  user: {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  team: {
    id?: number;
    name: string;
    slug: string;
    logo: string;
    primaryColor: string;
    homepage: string;
  };
  flow: {
    id?: string;
    publishedFlowId?: number;
    slug: string;
    data?: object;
  };
}
