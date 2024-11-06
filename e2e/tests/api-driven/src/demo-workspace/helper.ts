import gql from "graphql-tag";
import { $admin } from "../client";
import { Team } from "@opensystemslab/planx-core/types";
import { UPDATE_FLOW_QUERY } from "../permissions/queries/flows";
import { UUID } from "crypto";

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export const cleanup = async () => {
  await $admin.flow._destroyAll();
  await $admin.team._destroyAll();
  await $admin.user._destroyAll();
};

export const userExistsCheck = async (userId: number) => {
  const userOne = await $admin.user.getById(userId);
  return Boolean(userOne);
};

export const addDemoUserToTeam = async (userId: number, teamId: number) => {
  try {
    const memberAdded = await upsertMember({
      userId,
      teamId,
      role: "demoUser",
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const checkTeamsExist = async (teamArray) => {
  const existenceArray = await Promise.all(
    teamArray.map(async (team) => {
      const teamObj = await $admin.team.getBySlug(team.slug);
      return teamObj;
    }),
  );
  return existenceArray;
};

export const createTeams = async (array) => {
  const teamIdArray = await Promise.all(
    array.map(async (team) => {
      const id = await createTeam(team);
      return id;
    }),
  );
  return teamIdArray;
};

export const createFlow = async (client, args) => {
  try {
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
  } catch (error) {
    return false;
  }
};

export async function createTeam(
  newTeam: Team & { id: number },
): Promise<number> {
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
                # Create empty records for associated tables - these can get populated later
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

export async function upsertMember(args): Promise<boolean> {
  const response: { insert_team_members_one: { id: number } | null } =
    await $admin.client.request(
      gql`
        mutation UpsertTeamMember(
          $role: user_roles_enum = demoUser
          $team_id: Int
          $user_id: Int
        ) {
          insert_team_members_one(
            object: { team_id: $team_id, user_id: $user_id, role: $role }
          ) {
            id
          }
        }
      `,
      {
        team_id: args.teamId,
        user_id: args.userId,
        role: args.role,
      },
    );
  return Boolean(response.insert_team_members_one?.id);
}

export async function createUser(args): Promise<number> {
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
        first_name: args.first_name,
        last_name: args.last_name,
        email: args.email,
        is_platform_admin: args.isPlatformAdmin,
      },
    );
  return response.insert_users_one.id;
}
export async function createDemoUser(args): Promise<number> {
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
        first_name: args.first_name,
        last_name: args.last_name,
        email: args.email,
        is_platform_admin: args.isPlatformAdmin,
        role: "demoUser",
      },
    );
  return response.insert_users_one.id;
}

export async function getTeams(client) {
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

export async function getTeamAndFlowsBySlug(client, slug) {
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

export async function getFlowBySlug(client, slug) {
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

export async function updateFlow(client, flowId: UUID) {
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

export async function deleteFlow(client, flowId: UUID) {
  const { delete_flows_by_pk: response } = await client.request(
    gql`
      mutation MyMutation($flowId: uuid!) {
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
