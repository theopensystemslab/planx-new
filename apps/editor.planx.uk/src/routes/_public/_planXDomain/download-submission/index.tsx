import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { APIError } from "lib/api/client";
import { downloadSubmission } from "lib/api/send/requests";
import type { DownloadSubmissionResponse } from "lib/api/send/types";
import PublicLayout from "pages/layout/PublicLayout";
import StatusPage from "pages/Preview/StatusPage";
import React, { useEffect } from "react";
import z from "zod";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute(
  "/_public/_planXDomain/download-submission/",
)({
  validateSearch: zodValidator(searchSchema),
  component: () => (
    <PublicLayout>
      <StatusPage bannerHeading="Download submission">
        <RouteComponent />
      </StatusPage>
    </PublicLayout>
  ),
});

function RouteComponent() {
  const { token } = useSearch({
    from: "/_public/_planXDomain/download-submission/",
  });

  const { isPending, isError, error, data } = useQuery<
    Blob,
    APIError<DownloadSubmissionResponse>
  >({
    queryKey: ["download-submission", token],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!token,
    queryFn: () => downloadSubmission(token!),
  });

  useEffect(() => {
    if (!data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "submission.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  if (!token)
    return (
      <Typography variant="body2">
        To download your submission files, please use the link provided in your
        email.
      </Typography>
    );

  if (isPending)
    return <DelayedLoadingIndicator text="Preparing your download..." />;

  if (isError) {
    // Unhandled API error - throw to ErrorWrapper and Airbrake
    if (!error.data.error) throw error;

    // Handled API errors
    switch (error.data.error) {
      case "EXPIRED_ACCESS_TOKEN":
        return (
          <Typography variant="body2">
            This link has expired, you are unable to download this submission
          </Typography>
        );
      case "INVALID_ACCESS_TOKEN":
        return (
          <Typography variant="body2">
            This link is invalid, please check your email for the correct URL
          </Typography>
        );
      case "REVOKED_ACCESS_TOKEN":
        return (
          <Typography variant="body2">
            Access revoked - please contact our support team
          </Typography>
        );
    }
  }

  return <Typography variant="body2">Your download has started</Typography>;
}
