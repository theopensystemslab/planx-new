import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
