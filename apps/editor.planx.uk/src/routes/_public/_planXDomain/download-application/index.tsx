import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { downloadApplication } from "lib/api/send/requests";
import React from "react";
import z from "zod";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute(
  "/_public/_planXDomain/download-application/",
)({
  validateSearch: zodValidator(searchSchema),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useSearch({
    from: "/_public/_planXDomain/download-application/",
  });

  const { isPending, isError } = useQuery({
    queryKey: ["download-application", token],
    retry: false,
    enabled: !!token,
    queryFn: async () => {
      const blob = await downloadApplication(token!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "application.zip";
      a.click();
      URL.revokeObjectURL(url);
      return blob;
    },
  });

  if (!token)
    return (
      <p>
        To download your application files, please use the link provided in your
        email.
      </p>
    );
  if (isPending) return <p>Preparing your download...</p>;

  // TODO: granular errors
  if (isError)
    return <p>This link is invalid or has expired. Please contact support.</p>;

  return <p>Your download has started.</p>;
}
