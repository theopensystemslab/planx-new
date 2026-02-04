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
import { validateTeamRoute } from "utils/routeUtils/utils";

export const Route = createFileRoute(
  "/_public/$team/$flow/$sessionId/download-application",
)({
  head: createPublicRouteHead("download"),
  beforeLoad: async ({ params }) => {
    const { team: teamParam, flow: flowParam, sessionId } = params;

    if (!sessionId) {
      throw new Error("Session ID is required for download application");
    }

    try {
      await validateTeamRoute({ params });

      const data = await fetchDataForStandaloneView(flowParam, teamParam);
      setupStandaloneViewStore(data);

      return {
        sessionId,
        team: teamParam,
        flow: flowParam.split(",")[0],
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
  const params = Route.useParams();

  const { sessionId, team } = params;
  const flow = params.flow.split(",")[0];

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
