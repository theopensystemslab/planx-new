import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import About from "pages/FlowEditor/components/Settings/Flow/About";

export const Route = createFileRoute("/_authenticated/app/$team/$flow/about")({
  pendingComponent: DelayedLoadingIndicator,
  component: About,
});
