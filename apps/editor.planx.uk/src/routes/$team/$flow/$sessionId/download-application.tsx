import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { useStore } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { getTeamFromDomain } from "routes-navi/utils";
import WatermarkBackground from "ui/shared/WatermarkBackground";
import { fetchSettingsForPublishedView } from "utils/routeUtils/publishedQueries";

export const Route = createFileRoute(
  "/$team/$flow/$sessionId/download-application",
)({
  beforeLoad: async ({ params }) => {
    const { team: teamParam, flow: flowParam, sessionId } = params;
    const flowSlug = flowParam.split(",")[0];
    const teamSlug =
      teamParam || (await getTeamFromDomain(window.location.hostname));

    try {
      // Fetch settings for download application view
      const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
      const flow = data.flows[0];

      if (!flow) {
        throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
      }

      const publishedFlow = flow.publishedFlows[0]?.data;
      if (!publishedFlow) {
        throw new Error(`Flow ${flowSlug} not published for ${teamSlug}`);
      }

      // Validate session exists
      if (!sessionId) {
        throw new Error("Session ID is required for download application");
      }

      // Set up store with published flow data for download functionality
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

      return {
        flow,
        publishedFlow,
        settings: data,
        sessionId,
      };
    } catch (error) {
      console.error("Failed to load download application data:", error);
      throw error;
    }
  },

  errorComponent: ({ error }) => {
    if (error?.message?.includes("not found")) {
      return (
        <ErrorPage title="Application not found">
          Sorry, we can't find that application. The download link may have
          expired or the application may not exist.
        </ErrorPage>
      );
    }

    if (error?.message?.includes("not published")) {
      return (
        <ErrorPage title="Application download not available">
          This application download is not available. The service may not be
          published yet.
        </ErrorPage>
      );
    }

    if (error?.message?.includes("Session ID is required")) {
      return (
        <ErrorPage title="Invalid download link">
          This download link is invalid. Please check the URL or contact the
          service provider.
        </ErrorPage>
      );
    }

    return (
      <ErrorPage title="Download error">
        There was an error loading the application download. Please try again
        later.
      </ErrorPage>
    );
  },

  component: DownloadApplicationComponent,
});

function DownloadApplicationComponent() {
  const { sessionId } = Route.useParams();

  return (
    <PublicLayout>
      <WatermarkBackground
        variant="dark"
        opacity={0.05}
        forceVisibility={false}
      />
      <OfflineLayout>
        <SaveAndReturnLayout>
          <div>
            <h1>Download Application</h1>
            <p>Application download functionality will be implemented here.</p>
            <p>Session ID: {sessionId}</p>
            <p>This route handles downloading application documents.</p>
          </div>
        </SaveAndReturnLayout>
      </OfflineLayout>
    </PublicLayout>
  );
}
