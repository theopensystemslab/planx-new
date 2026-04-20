import { createFileRoute } from "@tanstack/react-router";
import FooterSettings from "pages/GlobalSettings/Footer";

export const Route = createFileRoute(
  "/_authenticated/app/global-settings/footer",
)({
  component: FooterSettings,
});
