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

export async function assignTeamMember(
  newMember: TeamMember,
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
          userId: newMember.user_id,
          teamId: newMember.team_id,
          role: newMember.role,
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
      query getFlowBySlug($flowId: uuid) {
        flows(where: { id: { _eq: $flowId } }) {
          id
          slug
        }
      }
    `,
    {
      flowId: flowId,
    },
  );

  return flow.slug;
}

export async function updateFlowStatus(
  client,
  flowId: string,
): Promise<string | number> {
  try {
    const {
      update_flows: { returning },
    } = await client.request(
      gql`
        mutation MyMutation($flowId: uuid) {
          update_flows(
            where: { id: { _eq: $flowId } }
            _set: { status: online }
          ) {
            returning {
              team {
                slug
              }
              status
            }
          }
        }
      `,
      {
        flowId: flowId,
      },
    );

    return returning[0].team.slug;
  } catch (error) {
    console.error("Unable to update flow status", error);
    return 0;
  }
}
