import { createFileRoute } from "@tanstack/react-router";
import NotionEmbed from "ui/editor/NotionEmbed";

export const Route = createFileRoute("/_authenticated/app/$team/resources")({
  staticData: { pageTitle: "Resources" },
  component: () => <NotionEmbed page="resources" title="Resources" />,
});
