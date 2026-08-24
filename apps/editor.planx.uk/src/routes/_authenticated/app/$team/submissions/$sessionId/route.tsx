import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/app/$team/submissions/$sessionId",
)({
  pendingComponent: () => null,
  component: () => <Outlet />,
});
