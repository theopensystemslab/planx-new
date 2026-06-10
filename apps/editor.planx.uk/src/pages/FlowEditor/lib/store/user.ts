import { Role, Team, User, UserTeams } from "@opensystemslab/planx-core/types";
import { ROLE_LABELS } from "pages/FlowEditor/components/Team/types";
import type { StateCreator } from "zustand";

import type { AuthStore } from "./auth";
import { TeamStore } from "./team";

export const getDisplayRole = (
  user: User,
  currentUserTeam: UserTeams | undefined,
): string => {
  if (user.isPlatformAdmin) return ROLE_LABELS.platformAdmin;
  if (user.isAnalyst) return ROLE_LABELS.analyst;
  if (currentUserTeam?.role === "teamAdmin") return ROLE_LABELS.teamAdmin;
  if (currentUserTeam?.role === "teamEditor") return ROLE_LABELS.teamEditor;

  return ROLE_LABELS.teamViewer;
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

    const currentUserTeam = user.teams.filter(
      ({ team: { slug } }) => slug === teamSlug,
    );

    if (!currentUserTeam) return;

    const isUserTeamAdmin = currentUserTeam.some(
      (user) => user.role === "teamAdmin",
    );

    if (isUserTeamAdmin) return "teamAdmin";

    return currentUserTeam[0].role;
  },

  getUserRole: () => {
    const { user, teamSlug } = get();
    if (!user) return;

    const currentUserTeam = user.teams.find(
      ({ team: { slug } }) => slug === teamSlug,
    );

    return getDisplayRole(user, currentUserTeam);
  },
});
