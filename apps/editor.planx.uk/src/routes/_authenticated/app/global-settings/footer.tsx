import { createFileRoute } from "@tanstack/react-router";
import FooterSettings from "pages/GlobalSettings/Footer";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/global-settings/footer",
)({
  component: FooterSettings,
  head: () => editorPageTitle("Footer elements", "Global settings"),
});
