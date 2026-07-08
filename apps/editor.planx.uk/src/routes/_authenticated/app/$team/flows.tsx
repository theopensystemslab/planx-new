import { createFileRoute, notFound } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import { startNewRecentFlowsJourney } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import Flows from "pages/Flows";
import type { GetAnyFlowsQuery, GetAnyFlowsVars } from "pages/Flows/queries";
import { GET_FLOWS } from "pages/Flows/queries";
import React from "react";
import { z } from "zod";

import { client } from "../../../../lib/graphql";

export const flowsSearchSchema = z.object({
  sort: fallback(
    z.enum(["last-edited", "last-published", "name"]),
    "last-edited",
  ).default("last-edited"),
  sortDirection: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
  search: z.string().optional(),
  "service-status": z.enum(["online", "offline"]).optional(),
  "flow-type": z
    .enum(["submission", "fee carrying", "service charge enabled"])
    .optional(),
  templates: z.enum(["templated", "source template"]).optional(),
  "lps-listing": z.enum(["listed", "not listed"]).optional(),
});

export type FlowSearch = z.infer<typeof flowsSearchSchema>;

export const Route = createFileRoute("/_authenticated/app/$team/flows")({
  beforeLoad: startNewRecentFlowsJourney,
  validateSearch: zodValidator(flowsSearchSchema),
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
  component: FlowsComponent,
});

function FlowsComponent() {
  const { flows, team } = Route.useLoaderData();
  return <Flows key={team.id} flows={flows} />;
}
