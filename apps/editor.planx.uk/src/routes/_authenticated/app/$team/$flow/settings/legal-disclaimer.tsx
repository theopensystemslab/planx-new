import { createFileRoute } from "@tanstack/react-router";
import LegalDisclaimer from "pages/FlowEditor/components/Settings/Flow/LegalDisclaimer";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/legal-disclaimer",
)({
  staticData: { pageTitle: "Legal disclaimer" },
  component: LegalDisclaimer,
});
