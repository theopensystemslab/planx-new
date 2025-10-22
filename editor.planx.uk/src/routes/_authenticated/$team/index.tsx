import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import Team from "pages/Team";
import React from "react";
import { z } from "zod";

import { getTeamFromDomain } from "../../../lib/utils";
import { useStore } from "../../../pages/FlowEditor/lib/store";

const teamSearchSchema = z.object({
  sort: fallback(
    z.enum(["last-edited", "last-published", "name"]),
    "last-edited",
  ).default("last-edited"),
  sortDirection: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
  "online-status": z.string().optional(),
  type: z.string().optional(),
  templates: z.string().optional(),
});

export type TeamSearch = z.infer<typeof teamSearchSchema>;

export const Route = createFileRoute("/_authenticated/$team/")({
  validateSearch: zodValidator(teamSearchSchema),
  beforeLoad: async ({ params }) => {
    const { initTeamStore, teamSlug: currentSlug } = useStore.getState();
    const routeSlug =
      params.team || (await getTeamFromDomain(window.location.hostname));

    if (!routeSlug) {
      throw new Error("Team not found");
    }

    if (currentSlug !== routeSlug) {
      try {
        await initTeamStore(routeSlug);
      } catch (error) {
        throw new Error(`Team not found: ${error}`);
      }
    }
  },
  loader: async () => {
    const { getTeam, getFlows } = useStore.getState();
    const team = getTeam();

    try {
      const flows = await getFlows(team.id);
      return {
        team,
        flows,
      };
    } catch (error) {
      throw new Error(`Failed to load flows: ${error}`);
    }
  },
  component: TeamComponent,
});

function TeamComponent() {
  const { flows } = Route.useLoaderData();

  return <Team flows={flows} />;
}
