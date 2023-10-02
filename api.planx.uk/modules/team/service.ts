import { getClient } from "../../client";
import { TeamRole } from "@opensystemslab/planx-core/types";

interface UpsertMember {
  userEmail: string;
  teamSlug: string;
  role: TeamRole;
}

interface RemoveUser {
  userEmail: string;
  teamSlug: string;
}

export const addMember = async ({
  userEmail,
  teamSlug,
  role,
}: UpsertMember) => {
  const $client = getClient();
  const { user, team } = await getUserAndTeam({ userEmail, teamSlug });

  const isSuccess = await $client.team.addMember({
    teamId: team.id,
    userId: user.id,
    role,
  });
  if (!isSuccess) throw Error(`Failed to assign ${userEmail} to ${teamSlug}`);
};

export const changeMemberRole = async ({
  userEmail,
  teamSlug,
  role,
}: UpsertMember) => {
  const $client = getClient();
  const { user, team } = await getUserAndTeam({ userEmail, teamSlug });

  const isSuccess = await $client.team.changeMemberRole({
    teamId: team.id,
    userId: user.id,
    role,
  });
  if (!isSuccess)
    throw Error(`Failed to assign ${role} (${teamSlug}) to ${userEmail}`);
};

export const removeMember = async ({ userEmail, teamSlug }: RemoveUser) => {
  const $client = getClient();
  const { user, team } = await getUserAndTeam({ userEmail, teamSlug });
  const isSuccess = await $client.team.removeMember({
    teamId: team.id,
    userId: user.id,
  });
  if (!isSuccess) throw Error(`Failed to remove ${userEmail} from ${teamSlug}`);
};

export const getUserAndTeam = async ({
  userEmail,
  teamSlug,
}: {
  userEmail: string;
  teamSlug: string;
}) => {
  const $client = getClient();

  const team = await $client.team.getBySlug(teamSlug);
  if (!team) throw Error(`Unable to find team matching slug ${teamSlug}`);

  const user = await $client.user.getByEmail(userEmail);
  if (!user) throw Error(`Unable to find team matching email ${userEmail}`);

  return { team, user };
};
