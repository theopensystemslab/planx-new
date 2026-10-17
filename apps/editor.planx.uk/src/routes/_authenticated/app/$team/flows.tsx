import {
  createFileRoute,
  notFound,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import { startNewRecentFlowsJourney } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import Flows from "pages/Flows";
import type { GetAnyFlowsQuery, GetAnyFlowsVars } from "pages/Flows/queries";
import { GET_FLOWS } from "pages/Flows/queries";

import { client } from "../../../../lib/graphql";
import { flowsSearchSchema, searchDefaults } from "./-flowsSearchSchema";

export const Route = createFileRoute("/_authenticated/app/$team/flows")({
  staticData: { pageTitle: "Flows" },
  beforeLoad: startNewRecentFlowsJourney,
  validateSearch: zodValidator(flowsSearchSchema),
  search: {
    middlewares: [stripSearchParams(searchDefaults)],
  },
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
    } catch {
      throw notFound();
    }
  },
  component: FlowsComponent,
});

function FlowsComponent() {
  const { flows, team } = Route.useLoaderData();
  return <Flows key={team.id} flows={flows} />;
}
