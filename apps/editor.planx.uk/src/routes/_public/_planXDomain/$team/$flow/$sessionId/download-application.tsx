import { createFileRoute } from "@tanstack/react-router";
import { VerifySubmissionEmail } from "pages/SubmissionDownload/VerifySubmissionEmail";
import React from "react";
import Main from "ui/shared/Main";
import {
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  PublicRouteLayout,
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
  const { sessionId, team, flow } = Route.useLoaderData();

  return (
    <PublicRouteLayout mode="download">
      <Main>
        <VerifySubmissionEmail
          params={{
            sessionId,
            team,
            flow,
          }}
        />
      </Main>
    </PublicRouteLayout>
  );
}
