import { createFileRoute } from "@tanstack/react-router";
import NotionEmbed from "ui/editor/NotionEmbed";

export const Route = createFileRoute("/_authenticated/app/$team/tutorials")({
  staticData: { pageTitle: "Tutorials" },
  component: () => <NotionEmbed page="tutorials" title="Tutorials" />,
});
