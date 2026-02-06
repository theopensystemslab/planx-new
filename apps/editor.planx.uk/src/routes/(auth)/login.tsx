import { createFileRoute, redirect } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { getCookie } from "lib/cookie";
import { useStore } from "pages/FlowEditor/lib/store";
import Login from "pages/Login/Login";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,

  beforeLoad: async ({ search }) => {
    // Check for auth cookie
    const authCookie = getCookie("auth");
    if (!authCookie) {
      return {};
    }

    // User is already authenticated - determine where to redirect
    // If there's an explicit redirectTo to a specific page, handle it
    if (search.redirectTo && search.redirectTo !== "/") {
      throw redirect({ to: search.redirectTo });
    }

    // Otherwise, redirect to the user's default team if they have one
    const user = await useStore.getState().initUserStore();
    if (user?.defaultTeamId) {
      const defaultTeam = user.teams.find(
        (t) => t.team.id === user.defaultTeamId,
      );
      if (defaultTeam) {
        throw redirect({
          to: "/$team",
          params: { team: defaultTeam.team.slug },
        });
      }
    }

    // If neither, redirect to `/`
    throw redirect({ to: "/" });
  },

  component: Login,
  pendingComponent: DelayedLoadingIndicator,
});
