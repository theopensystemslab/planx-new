import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import Login from "pages/Login/Login";

export const Route = createFileRoute("/(auth)/login")({
  component: Login,
  pendingComponent: DelayedLoadingIndicator,
});
