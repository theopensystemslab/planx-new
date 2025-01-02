import { gql } from "graphql-tag";
import { $admin } from "../client.js";
import { Team, User } from "@opensystemslab/planx-core/types";
import { UUID } from "crypto";

export type Flow = {
  creator_id?: number;
  slug: string;
  id: UUID;
};

export type TeamsAndFlows = {
  id: number;
  slug: string;
  flows: Flow[];
};
export type FlowArgs = { teamId: number; slug: string; name: string };

export type DataTableRecord = Record<string, string>;
export type DataTableArray = Record<string, string>[];

export const cleanup = async () => {
  await $admin.flow._destroyAll();
  await $admin.team._destroyAll();
  await $admin.user._destroyAll();
};

export const checkTeamsExist = async (
  teamArray: DataTableArray,
): Promise<Team[]> => {
  const existenceArray: Team[] = [];
  for (const team of teamArray) {
    const teamObj = await $admin.team.getBySlug(team.slug);
    existenceArray.push(teamObj);
  }
  return existenceArray;
};

export async function createTeam(newTeam: DataTableRecord): Promise<number> {
  try {
    const response: { insert_teams_one: { id: number } } =
      await $admin.client.request(
        gql`
          mutation CreateTeam($name: String!, $id: Int, $slug: String!) {
            insert_teams_one(
              object: {
                id: $id
                name: $name
                slug: $slug
                team_settings: { data: {} }
                integrations: { data: {} }
              }
            ) {
              id
            }
          }
        `,
        {
          ...newTeam,
        },
      );
    return response.insert_teams_one.id;
  } catch (error) {
    return 0;
  }
}

export const createTeamFromArray = async (array: DataTableArray) => {
  const teamIdArray = await Promise.all(
    array.map(async (team) => {
      const id = await createTeam(team);
      return id;
    }),
  );
  return teamIdArray;
};

export const createFlowFromArray = async (
  client,
  flow: DataTableRecord,
): Promise<Flow | false> => {
  try {
    const flowId = await createFlow(client, {
      teamId: Number(flow.team_id),
      name: flow.name,
      slug: flow.slug,
    });
    return flowId;
  } catch (error) {
    console.error(`Error adding flow ${flow.slug}`, error);
    return false;
  }
};

export const createFlow = async (
  client,
  args: FlowArgs,
): Promise<Flow | false> => {
  const { flow } = await client.request(
    gql`
      mutation InsertFlow($teamId: Int!, $slug: String!, $name: String!) {
        flow: insert_flows_one(
          object: { team_id: $teamId, slug: $slug, name: $name }
        ) {
          id
          slug
          creator_id
        }
      }
    `,
    {
      teamId: args.teamId,
      slug: args.slug,
      name: args.name,
    },
  );

  return flow;
};

export async function createUser(args: Omit<User, "teams">): Promise<number> {
  const response: { insert_users_one: { id: number } } =
    await $admin.client.request(
      gql`
        mutation CreateUser(
          $id: Int
          $first_name: String!
          $last_name: String!
          $email: String!
          $is_platform_admin: Boolean
        ) {
          insert_users_one(
            object: {
              id: $id
              first_name: $first_name
              last_name: $last_name
              email: $email
              is_platform_admin: $is_platform_admin
            }
          ) {
            id
          }
        }
      `,
      {
        id: args.id,
        first_name: args.firstName,
        last_name: args.lastName,
        email: args.email,
        is_platform_admin: args.isPlatformAdmin,
      },
    );
  return response.insert_users_one.id;
}

export async function createDemoUser(
  args: Omit<User, "teams">,
): Promise<number> {
  const response: { insert_users_one: { id: number } } =
    await $admin.client.request(
      gql`
        mutation CreateUser(
          $id: Int
          $first_name: String!
          $last_name: String!
          $email: String!
          $is_platform_admin: Boolean = false
          $role: user_roles_enum!
        ) {
          insert_users_one(
            object: {
              id: $id
              first_name: $first_name
              last_name: $last_name
              email: $email
              is_platform_admin: $is_platform_admin
              teams: { data: { role: $role, team_id: 32 } }
            }
          ) {
            id
          }
        }
      `,
      {
        id: args.id,
        first_name: args.firstName,
        last_name: args.lastName,
        email: args.email,
        is_platform_admin: args.isPlatformAdmin,
        role: "demoUser",
      },
    );
  return response.insert_users_one.id;
}

export async function getTeams(client): Promise<Team[]> {
  const { teams } = await client.request(gql`
    query getTeams {
      teams {
        id
        slug
        team_settings {
          homepage
        }
      }
    }
  `);

  return teams;
}

export async function getTeamAndFlowsBySlug(
  client,
  slug: string,
): Promise<TeamsAndFlows> {
  const {
    teams: [team],
  } = await client.request(
    gql`
      query getTeamAndFlowsBySlug($slug: String) {
        teams(where: { slug: { _eq: $slug } }) {
          id
          slug
          flows {
            creator_id
            slug
            id
          }
        }
      }
    `,
    {
      slug,
    },
  );

  return team;
}

export async function getFlowBySlug(client, slug: string): Promise<Flow> {
  const {
    flows: [flow],
  } = await client.request(
    gql`
      query getFlowBySlug($slug: String) {
        flows(where: { slug: { _eq: $slug } }) {
          slug
          id
        }
      }
    `,
    {
      slug: slug,
    },
  );

  return flow;
}

export async function updateFlow(client, flowId: UUID): Promise<UUID> {
  const { update_flows_by_pk: response } = await client.request(
    gql`
      mutation updateFlow($flowId: uuid!) {
        result: update_flows_by_pk(
          pk_columns: { id: $flowId }
          _set: { slug: "new-slug", name: "new Name" }
        ) {
          id
        }
      }
    `,

    { flowId: flowId },
  );
  return response;
}

export async function deleteFlow(client, flowId: UUID): Promise<UUID> {
  const { delete_flows_by_pk: response } = await client.request(
    gql`
      mutation deleteFlow($flowId: uuid!) {
        delete_flows_by_pk(id: $flowId) {
          id
        }
      }
    `,

    { flowId: flowId },
  );
  return response;
}
export async function updateTeamSettings(client, teamId: number) {
  try {
    const { update_team_settings: response } = await client.request(
      gql`
        mutation updateTeamSettings($teamId: Int!) {
          update_team_settings(
            where: { team_id: { _eq: $teamId } }
            _set: {
              homepage: "newpage.com"
              submission_email: "new.email@email.com"
            }
          ) {
            returning {
              team_id
              submission_email
              homepage
            }
          }
        }
      `,
      {
        teamId: teamId,
      },
    );
    return response;
  } catch (error) {
    return false;
  }
}
