import { createFileRoute } from "@tanstack/react-router";
import NotionEmbed from "ui/editor/NotionEmbed";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/onboarding")({
  component: () => <NotionEmbed page="onboarding" title="Onboarding" />,
  head: () => editorPageTitle("Onboarding"),
});
