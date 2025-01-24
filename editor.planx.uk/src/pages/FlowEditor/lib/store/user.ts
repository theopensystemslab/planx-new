import { CoreDomainClient } from "@opensystemslab/planx-core";
import { Role, Team, User, UserTeams } from "@opensystemslab/planx-core/types";
import axios from "axios";
import { handleExpiredJWTErrors } from "lib/graphql";
import type { StateCreator } from "zustand";

import { EditorStore } from "./editor";
import { TeamStore } from "./team";

export interface UserStore {
  user?: User;
  jwt?: string;

  setUser: (user: User & { jwt: string }) => void;
  getUser: () => User | undefined;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
  initUserStore: () => Promise<void>;
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

  getUser: () => get().user,

  canUserEditTeam(teamSlug) {
    const user = get().getUser();
    if (!user) return false;

    const canEditTeam = (team: UserTeams) =>
      team.role !== "teamViewer" && team.team.slug === teamSlug;

    return user.isPlatformAdmin || user.teams.some(canEditTeam);
  },

  async initUserStore() {
    const { getUser, setUser } = get();
    const currentUser = getUser();
    if (currentUser) return;

    const user = await getLoggedInUser();
    setUser(user);
  },

  getUserRoleForCurrentTeam: () => {
    const { user, teamSlug } = get();
    if (!user) return;

    if (user.isPlatformAdmin) return "platformAdmin";

    const currentUserTeam = user.teams.find(
      ({ team: { slug } }) => slug === teamSlug,
    );
    if (!currentUserTeam) return;

    return currentUserTeam.role;
  },
});

const getLoggedInUser = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/user/me`;
  try {
    const response = await axios.get<User & { jwt: string }>(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user matching JWT cookie");
    handleExpiredJWTErrors()
  }
};
