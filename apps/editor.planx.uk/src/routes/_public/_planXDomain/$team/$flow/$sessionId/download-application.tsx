import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import StatusPage from "pages/Preview/StatusPage";
import React from "react";
import Main from "ui/shared/Main";
import WatermarkBackground from "ui/shared/WatermarkBackground";
import {
  createPublicRouteErrorComponent,
  createPublicRouteHead,
} from "utils/routeUtils/publicRouteHelpers";
import {
  fetchDataForStandaloneView,
  setupStandaloneViewStore,
} from "utils/routeUtils/standaloneViewHelpers";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/$sessionId/download-application",
)({
  head: createPublicRouteHead("download"),
  loader: async ({ params, context }) => {
    const { team, flow } = context;
    const { sessionId } = params;

    try {
      const data = await fetchDataForStandaloneView(flow, team);
      setupStandaloneViewStore(data);

      return {
        sessionId,
        team,
        flow: flow.split(",")[0],
        standaloneData: data,
      };
    } catch (error) {
      console.error("Failed to load download application data:", error);
      throw error;
    }
  },
  errorComponent: createPublicRouteErrorComponent("download"),
  component: DownloadApplicationComponent,
});

function DownloadApplicationComponent() {
  return (
    <>
      <WatermarkBackground variant="dark" opacity={0.05} />
      <Main>
        <StatusPage
          bannerHeading="Expired link"
          bannerText="This link is no longer valid"
        >
          <Typography variant="body2">
            This link is no longer active - please contact the support team for
            assistance.
          </Typography>
        </StatusPage>
      </Main>
    </>
  );
}
