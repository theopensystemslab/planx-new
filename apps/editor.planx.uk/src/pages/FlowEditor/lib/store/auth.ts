import type { User } from "@opensystemslab/planx-core/types";
import { getUser, logout } from "lib/api/auth/requests";
import { clearCookie, setCookie } from "lib/cookie";
import { client } from "lib/graphql";
import { disconnectShareDB } from "pages/FlowEditor/lib/sharedb";
import { type StateCreator } from "zustand";

export interface AuthStore {
  authStatus: "idle" | "loading" | "authenticated" | "unauthenticated";
  user: User | null;
  jwt: string | null;

  initAuthStore: () => Promise<void>;
  logout: () => Promise<void>;
}

export const authStore: StateCreator<AuthStore, [], [], AuthStore> = (
  set,
  get,
) => ({
  authStatus: "idle",
  user: null,
  jwt: null,

  initAuthStore: async () => {
    if (get().authStatus === "authenticated") return;
    if (get().authStatus === "loading") return;

    set({ authStatus: "loading" });

    // On local and Pizza environments, JWT is stored as a URL param due to restrictions on
    // cross-domain cookies (we auth via planx.dev). On staging and production these cookies
    // are set via response headers from the API.
    const url = new URL(window.location.href);
    const jwtParam = url.searchParams.get("jwt");

    if (jwtParam) {
      setCookie("jwt", jwtParam);
      setCookie("auth", JSON.stringify({ loggedIn: true }));

      url.searchParams.delete("jwt");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search,
      );
    }

    try {
      const result = await getUser();

      if (!result) {
        set({ authStatus: "unauthenticated", user: null, jwt: null });
        return;
      }

      const { jwt, ...user } = result;
      set({
        authStatus: "authenticated",
        user,
        jwt,
      });
    } catch (err) {
      set({ authStatus: "unauthenticated", user: null, jwt: null });
    }
  },

  logout: async () => {
    await logout();

    // Clean up client connections
    disconnectShareDB();
    await client.resetStore();

    // Clear all client-side auth tokens
    clearCookie("auth");
    clearCookie("jwt");
    localStorage.removeItem("jwt");

    set({
      authStatus: "unauthenticated",
      user: null,
      jwt: null,
    });
  },
});
