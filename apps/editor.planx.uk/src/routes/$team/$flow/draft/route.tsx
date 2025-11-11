import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getFlattenedFlowData } from "lib/api/flow/requests";
import { queryClient } from "lib/queryClient";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { useStore } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";
import { fetchSettingsForPublishedView } from "utils/routeUtils/publishedQueries";
import { getTeamFromDomain } from "utils/routeUtils/utils";

export const Route = createFileRoute("/$team/$flow/draft")({
  beforeLoad: async ({ params }) => {
    const { team: teamParam, flow: flowParam } = params;
    const flowSlug = flowParam.split(",")[0];
    const teamSlug =
      teamParam || (await getTeamFromDomain(window.location.hostname));

    try {
      // Fetch settings using the same function as published routes
      const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
      const flow = data.flows[0];

      if (!flow) {
        throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
      }

      // Fetch current draft flow data (not published)
      const flowData = await queryClient.fetchQuery({
        queryKey: ["flattenedFlowData", "draft", flow.id],
        queryFn: () => getFlattenedFlowData({ flowId: flow.id }),
      });

      // Set up store with draft flow data
      const state = useStore.getState();
      state.setFlow({
        id: flow.id,
        flow: flowData,
        flowSlug,
        flowStatus: flow.status,
        flowName: flow.name,
      });
      state.setGlobalSettings(data.globalSettings[0]);
      state.setFlowSettings(flow.settings);
      state.setTeam(flow.team);

      return {
        flow,
        flowData,
        settings: data,
      };
    } catch (error) {
      console.error("Failed to load draft data:", error);
      throw error;
    }
  },

  head: () => ({
    meta: [
      {
        name: "robots",
        content: "noindex, nofollow",
      },
      {
        name: "googlebot",
        content: "noindex, nofollow",
      },
    ],
  }),

  errorComponent: ({ error }) => {
    if (error?.message?.includes("not found")) {
      return (
        <ErrorPage title="Draft flow not found">
          The draft flow you're looking for doesn't exist or you don't have
          permission to access it.
        </ErrorPage>
      );
    }

    return (
      <ErrorPage title="Draft flow error">
        There was an error loading the draft flow. Please try again later.
      </ErrorPage>
    );
  },

  component: DraftLayoutComponent,
});

function DraftLayoutComponent() {
  return (
    <PublicLayout>
      <WatermarkBackground
        variant="dark"
        opacity={0.05}
        forceVisibility={false}
      />
      <OfflineLayout>
        <SaveAndReturnLayout>
          <Outlet />
        </SaveAndReturnLayout>
      </OfflineLayout>
    </PublicLayout>
  );
}
