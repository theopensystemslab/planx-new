import { Role, Team, User, UserTeams } from "@opensystemslab/planx-core/types";
import type { StateCreator } from "zustand";

import type { AuthStore } from "./auth";
import { TeamStore } from "./team";

export const getDisplayRole = (user: User): string => {
  if (user.isPlatformAdmin) return "Platform Admin";
  if (user.isAnalyst) return "Analyst";
  return "Team Editor";
};

export interface UserStore {
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
  getUserRoleForCurrentTeam: () => Role | undefined;
  getUserRole: () => string | undefined;
}

export const userStore: StateCreator<
  UserStore & TeamStore & AuthStore,
  [],
  [],
  UserStore
> = (_set, get) => ({
  canUserEditTeam(teamSlug) {
    const user = get().user;
    if (!user) return false;

    const canEditTeam = (team: UserTeams) =>
      team.role !== "teamViewer" && team.team.slug === teamSlug;

    return user.isPlatformAdmin || user.teams.some(canEditTeam);
  },

  getUserRoleForCurrentTeam: () => {
    const { user, teamSlug } = get();
    if (!user) return;

    if (user.isPlatformAdmin) return "platformAdmin";
    if (user.isAnalyst) return "analyst";

    const currentUserTeam = user.teams.find(
      ({ team: { slug } }) => slug === teamSlug,
    );
    if (!currentUserTeam) return;

    return currentUserTeam.role;
  },

  getUserRole: () => {
    const user = get().user;
    if (!user) return;
    return getDisplayRole(user);
  },
});
