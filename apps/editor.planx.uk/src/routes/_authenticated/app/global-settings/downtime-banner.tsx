import { createFileRoute } from "@tanstack/react-router";
import DowntimeBannerSettings from "pages/GlobalSettings/DowntimeBanner";

export const Route = createFileRoute(
  "/_authenticated/app/global-settings/downtime-banner",
)({
  staticData: { pageTitle: "Downtime banner" },
  component: DowntimeBannerSettings,
});
