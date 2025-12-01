import { CoreDomainClient } from "@opensystemslab/planx-core";
import { Role, Team, User, UserTeams } from "@opensystemslab/planx-core/types";
import { getUser } from "lib/api/auth/requests";
import { handleExpiredJWTErrors } from "lib/graphql/auth";
import type { StateCreator } from "zustand";

import { EditorStore } from "./editor";
import { TeamStore } from "./team";

export interface UserStore {
  user?: User;
  jwt?: string;

  setUser: (user: User & { jwt: string }) => void;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
  initUserStore: () => Promise<User>;
  getUserRoleForCurrentTeam: () => Role | undefined;
}

export const userStore: StateCreator<
  UserStore & EditorStore & TeamStore,
  [],
  [],
  UserStore
> = (set, get) => ({
  setUser: ({ jwt, ...user }) => {
    const authenticatedClient = new CoreDomainClient({
      targetURL: import.meta.env.VITE_APP_HASURA_URL!,
      auth: { jwt },
    });
    set({ $client: authenticatedClient });
    set({ jwt, user });
  },

  canUserEditTeam(teamSlug) {
    const user = get().user;
    if (!user) return false;

    const canEditTeam = (team: UserTeams) =>
      team.role !== "teamViewer" && team.team.slug === teamSlug;

    return user.isPlatformAdmin || user.teams.some(canEditTeam);
  },

  async initUserStore() {
    const { user, setUser } = get();
    if (user) return user;

    try {
      const user = await getUser();
      setUser(user);
      return user;
    } catch (error) {
      handleExpiredJWTErrors();
      throw Error("Failed to fetch user matching JWT cookie");
    }
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
});
