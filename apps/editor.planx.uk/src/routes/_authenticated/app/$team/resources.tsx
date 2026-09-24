import { createFileRoute } from "@tanstack/react-router";
import NotionEmbed from "ui/editor/NotionEmbed";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/resources")({
  component: () => <NotionEmbed page="resources" title="Resources" />,
  head: () => editorPageTitle("Resources"),
});
