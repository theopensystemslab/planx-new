import { useQuery } from "@apollo/client";
import type { User } from "@opensystemslab/planx-core/types";
import { partition } from "lodash";

import { GET_USERS_FOR_TEAM_QUERY } from "../queries";
import type { TeamMember } from "../types";
import {
  hasEmailPresent,
  isPlatformAdmin,
  userToTeamMember,
} from "../utils";

export const useTeamMembers = (teamSlug: string) => {
  const { data, loading, error } = useQuery<{ users: User[] }>(
    GET_USERS_FOR_TEAM_QUERY,
    { variables: { teamSlug } },
  );

  const teamMembers: TeamMember[] = data?.users.map(userToTeamMember) ?? [];

  const [platformAdmins, others] = partition(teamMembers, isPlatformAdmin);
  const [activeMembers, archivedMembers] = partition(others, hasEmailPresent);

  return {
    loading,
    error,
    platformAdmins: platformAdmins.filter(hasEmailPresent),
    activeMembers,
    archivedMembers,
  };
};