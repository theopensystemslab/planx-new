import { createFileRoute } from "@tanstack/react-router";
import FeatureFlagsSettings from "pages/GlobalSettings/FeatureFlags";

export const Route = createFileRoute(
  "/_authenticated/app/global-settings/feature-flags",
)({
  component: FeatureFlagsSettings,
});
