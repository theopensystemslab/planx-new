import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { APIError } from "lib/api/client";
import { sendNewDownloadLinkEmail } from "lib/api/send/requests";
import {
  type SendNewDownloadLinkFailure,
  SendNewDownloadLinkSuccess,
} from "lib/api/send/types";
import StatusPage from "pages/Preview/StatusPage";
import React, { useEffect } from "react";
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
  component: () => (
    <>
      <WatermarkBackground variant="dark" opacity={0.05} />
      <Main>
        <StatusPage bannerHeading="Download submission">
          <DownloadApplicationComponent />
        </StatusPage>
      </Main>
    </>
  ),
});

function DownloadApplicationComponent() {
  const { team, flow, sessionId } = Route.useLoaderData();

  const { mutate, isIdle, isPending, isError, error } = useMutation<
    SendNewDownloadLinkSuccess,
    APIError<SendNewDownloadLinkFailure>
  >({
    mutationFn: async () =>
      await sendNewDownloadLinkEmail({
        localAuthority: team,
        flowSlug: flow,
        sessionId,
      }),
  });

  useEffect(() => {
    if (isIdle) mutate();
  }, [isIdle, mutate]);

  if (isPending || isIdle)
    return <DelayedLoadingIndicator text="Verifying your link..." />;

  if (isError) {
    // Unhandled API error - throw to ErrorWrapper and Airbrake
    if (!error?.data?.error) throw error;

    // Handled API errors
    switch (error.data.error) {
      case "EMAIL_NOT_CONFIGURED":
        return (
          <Typography variant="body2">
            Invalid link - this service does not use the "send to email"
            feature.
          </Typography>
        );
      case "LINK_ALREADY_EMAILED":
        return (
          <Typography variant="body2">
            Please check your inbox - we have previously sent you a secure
            download link to this submission.
          </Typography>
        );
      case "SESSION_NOT_FOUND":
        return (
          <Typography variant="body2">
            Invalid link - unable to find matching session.
          </Typography>
        );
    }
  }

  return (
    <Typography variant="body2">
      This is a legacy URL which no longer provides access to the submission in
      question. We've emailed you a new link which will allow you to access the
      submission ZIP.
    </Typography>
  );
}
