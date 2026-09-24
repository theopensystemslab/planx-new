import { createFileRoute } from "@tanstack/react-router";
import NotionEmbed from "ui/editor/NotionEmbed";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/tutorials")({
  component: () => <NotionEmbed page="tutorials" title="Tutorials" />,
  head: () => editorPageTitle("Tutorials"),
});
