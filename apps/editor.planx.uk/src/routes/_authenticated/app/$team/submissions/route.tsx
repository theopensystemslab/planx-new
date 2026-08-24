import { createFileRoute, Outlet } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";

export const Route = createFileRoute("/_authenticated/app/$team/submissions")({
  validateSearch: (search: Record<string, unknown>): { detail?: string } => ({
    detail: search.detail as string | undefined,
  }),
  pendingComponent: DelayedLoadingIndicator,
  component: () => <Outlet />,
});
