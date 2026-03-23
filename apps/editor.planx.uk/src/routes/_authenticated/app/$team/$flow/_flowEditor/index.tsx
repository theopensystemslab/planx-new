import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/",
)({
  component: () => null,
});
