import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { downloadSubmission } from "lib/api/send/requests";
import PublicLayout from "pages/layout/PublicLayout";
import StatusPage from "pages/Preview/StatusPage";
import React from "react";
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

  const { isPending, isError } = useQuery({
    queryKey: ["download-submission", token],
    retry: false,
    enabled: !!token,
    queryFn: async () => {
      const blob = await downloadSubmission(token!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "submission.zip";
      a.click();
      URL.revokeObjectURL(url);
      return blob;
    },
  });

  if (!token)
    return (
      <p>
        To download your submission files, please use the link provided in your
        email.
      </p>
    );
  if (isPending) return <p>Preparing your download...</p>;

  // TODO: granular errors
  if (isError)
    return <p>This link is invalid or has expired. Please contact support.</p>;

  return <p>Your download has started.</p>;
}
