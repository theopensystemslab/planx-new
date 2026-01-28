import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import NotionEmbed from "ui/editor/NotionEmbed";

export const Route = createFileRoute("/_authenticated/resources")({
  component: () => <NotionEmbed page="resources" title="Resources" />,
});
