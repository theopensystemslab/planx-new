import { createFileRoute } from "@tanstack/react-router";
import NotionEmbed from "ui/editor/NotionEmbed";

export const Route = createFileRoute("/_authenticated/app/$team/onboarding")({
  staticData: { pageTitle: "Onboarding" },
  component: () => <NotionEmbed page="onboarding" title="Onboarding" />,
});
