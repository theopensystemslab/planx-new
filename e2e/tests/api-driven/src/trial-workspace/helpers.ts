import { gql } from "graphql-tag";
import { $admin } from "../client.js";

export const cleanup = async () => {
  await $admin.flow._destroyPublishedAll();
  await $admin.flow._destroyAll();
  await $admin.team.removeMember({ userId: 12, teamId: 1 });
  await $admin.team.removeMember({ userId: 32, teamId: 3 });
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};

export type TeamMember = {
  user_id: number;
  team_id: number;
  role: string;
};

export type TeamRecord = {
  id: string | number;
  name: string;
  slug: string;
  is_trial_team: boolean | string;
};

export type UserRecord = {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
};

export type FlowRecord = {
  creator_id: string | number;
  name: string;
  slug: string;
  team_id: string | number;
};

export async function createTeam(teamData: TeamRecord): Promise<number> {
  try {
    const response: { insert_teams_one: { id: number } } =
      await $admin.client.request(
        gql`
          mutation CreateTeam(
            $name: String!
            $id: Int
            $slug: String!
            $is_trial_team: Boolean
          ) {
            insert_teams_one(
              object: {
                id: $id
                name: $name
                slug: $slug
                is_trial_team: $is_trial_team
                team_settings: { data: {} }
                integrations: { data: {} }
              }
            ) {
              id
            }
          }
        `,
        {
          name: teamData.name,
          id: Number(teamData.id),
          slug: teamData.slug,
          is_trial_team: teamData.is_trial_team === "true" ? true : false,
        },
      );
    return response.insert_teams_one.id;
  } catch (error) {
    return 0;
  }
}

export async function assignTeamMember(
  memberData: TeamMember,
): Promise<string | number> {
  try {
    const response: { insert_team_members_one: { id: string } } =
      await $admin.client.request(
        gql`
          mutation assignTeamMember(
            $userId: Int!
            $teamId: Int!
            $role: user_roles_enum!
          ) {
            insert_team_members_one(
              object: { user_id: $userId, team_id: $teamId, role: $role }
            ) {
              id
            }
          }
        `,
        {
          userId: memberData.user_id,
          teamId: memberData.team_id,
          role: memberData.role,
        },
      );
    return response.insert_team_members_one.id;
  } catch (error) {
    console.error(`Error adding team member`, error);
    return 0;
  }
}

export async function getFlowById(client, flowId: string): Promise<string> {
  const {
    flows: [flow],
  } = await client.request(
    gql`
      query getFlowById($flowId: uuid) {
        flows(where: { id: { _eq: $flowId } }) {
          team {
            is_trial_team
          }
        }
      }
    `,
    {
      flowId: flowId,
    },
  );

  return flow.team.is_trial_team;
}

export async function updateFlowStatus(
  client,
  flowId: string,
): Promise<string> {
  try {
    const {
      update_flows: { flow },
    } = await client.request(
      gql`
        mutation updateFlowStatus($flowId: uuid!) {
          update_flows(
            where: { id: { _eq: $flowId } }
            _set: { status: online }
          ) {
            flow: returning {
              team {
                is_trial_team
              }
            }
          }
        }
      `,
      {
        flowId: flowId,
      },
    );

    return flow[0].team.is_trial_team;
  } catch (error) {
    console.error("Unable to update flow status", error);
    return "error updating flow status";
  }
}
