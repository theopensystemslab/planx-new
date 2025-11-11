import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { useStore } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { getTeamFromDomain } from "routes-navi/utils";
import WatermarkBackground from "ui/shared/WatermarkBackground";
import {
  fetchSettingsForPublishedView,
  getLastPublishedAt,
} from "utils/routeUtils/publishedQueries";
import { z } from "zod";

// Search params schema for published route
const publishedSearchSchema = z.object({
  analytics: z.boolean().optional(),
});

export const Route = createFileRoute("/$team/$flow/published")({
  validateSearch: zodValidator(publishedSearchSchema),

  beforeLoad: async ({ params }) => {
    const { team: teamParam, flow: flowParam } = params;
    const flowSlug = flowParam.split(",")[0];
    const teamSlug =
      teamParam || (await getTeamFromDomain(window.location.hostname));

    try {
      // Fetch settings for published view
      const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
      const flow = data.flows[0];

      if (!flow) {
        throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
      }

      const publishedFlow = flow.publishedFlows[0]?.data;
      if (!publishedFlow) {
        throw new Error(`Flow ${flowSlug} not published for ${teamSlug}`);
      }

      // Get last published date
      const lastPublishedDate = await getLastPublishedAt(flow.id);

      // Set up store with published flow data
      const state = useStore.getState();
      state.setFlow({
        id: flow.id,
        flow: publishedFlow,
        flowSlug,
        flowStatus: flow.status,
        flowName: flow.name,
      });
      state.setGlobalSettings(data.globalSettings[0]);
      state.setFlowSettings(flow.settings);
      state.setTeam(flow.team);
      useStore.setState({ lastPublishedDate });

      return {
        flow,
        publishedFlow,
        settings: data,
        lastPublishedDate,
      };
    } catch (error) {
      console.error("Failed to load published data:", error);
      throw error;
    }
  },

  errorComponent: ({ error }) => {
    if (error?.message?.includes("not found")) {
      return (
        <ErrorPage title="Published flow not found">
          The published flow you're looking for doesn't exist or hasn't been
          published yet.
        </ErrorPage>
      );
    }

    if (error?.message?.includes("not published")) {
      return (
        <ErrorPage title="Flow not published">
          This flow hasn't been published yet. Please contact the service
          provider.
        </ErrorPage>
      );
    }

    return (
      <ErrorPage title="Published flow error">
        There was an error loading the published flow. Please try again later.
      </ErrorPage>
    );
  },

  component: PublishedLayoutComponent,
});

function PublishedLayoutComponent() {
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
