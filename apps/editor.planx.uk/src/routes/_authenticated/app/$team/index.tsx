import { createFileRoute, notFound } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import Team from "pages/Team";
import React from "react";
import { z } from "zod";

import { useStore } from "../../../../pages/FlowEditor/lib/store";

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

export const Route = createFileRoute("/_authenticated/app/$team/")({
  validateSearch: zodValidator(teamSearchSchema),
  pendingComponent: RouteLoadingIndicator,
  loader: async ({ context }) => {
    const { team } = context;

    try {
      const flows = await useStore.getState().getFlows(team.id);
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
