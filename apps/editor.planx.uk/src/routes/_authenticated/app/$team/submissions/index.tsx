import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/$team/submissions/")({
  component: () => null,
});
