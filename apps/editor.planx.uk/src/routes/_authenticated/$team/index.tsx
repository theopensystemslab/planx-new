import { createFileRoute, notFound } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import Team from "pages/Team";
import React from "react";
import { getTeamFromDomain } from "utils/routeUtils/utils";
import { z } from "zod";

import { useStore } from "../../../pages/FlowEditor/lib/store";

export const teamSearchSchema = z.object({
  sort: fallback(
    z.enum(["last-edited", "last-published", "name"]),
    "last-edited",
  ).default("last-edited"),
  sortDirection: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
  search: z.string().optional(),
  "online-status": z.enum(["online", "offline"]).optional(),
  "flow-type": z
    .enum(["submission", "fee carrying", "service charge enabled"])
    .optional(),
  templates: z.enum(["templated", "source template"]).optional(),
  "lps-listing": z.enum(["listed", "not listed"]).optional(),
});

export type TeamSearch = z.infer<typeof teamSearchSchema>;

export const Route = createFileRoute("/_authenticated/$team/")({
  validateSearch: zodValidator(teamSearchSchema),
  beforeLoad: async ({ params }) => {
    const { initTeamStore, teamSlug: currentSlug } = useStore.getState();
    const routeSlug =
      params.team || (await getTeamFromDomain(window.location.hostname));

    if (!routeSlug) {
      throw notFound();
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
      throw notFound();
    }
  },
  component: TeamComponent,
});

function TeamComponent() {
  const { flows } = Route.useLoaderData();

  return <Team flows={flows} />;
}
