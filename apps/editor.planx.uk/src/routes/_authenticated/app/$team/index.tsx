import { createFileRoute, notFound } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import { startNewRecentFlowsJourney } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import Team from "pages/Team";
import {
  GET_FLOWS,
  GetAnyFlowsQuery,
  GetAnyFlowsVars,
} from "pages/Team/queries";
import React from "react";
import { z } from "zod";

import { client } from "../../../../lib/graphql";

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
  beforeLoad: startNewRecentFlowsJourney,
  validateSearch: zodValidator(teamSearchSchema),
  pendingComponent: RouteLoadingIndicator,
  loader: async ({ context }) => {
    const { team } = context;

    try {
      const result = await client.query<GetAnyFlowsQuery, GetAnyFlowsVars>({
        query: GET_FLOWS,
        variables: { teamId: team.id },
        fetchPolicy: "network-only",
      });

      return { team, flows: result.data.flows };
    } catch (error) {
      throw notFound();
    }
  },
  component: TeamComponent,
});

function TeamComponent() {
  const { flows, team } = Route.useLoaderData();
  return <Team key={team.id} flows={flows} />;
}
