import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy path. The docs now open in a dialog via `?guide` (see EditorNavMenu),
// so redirect old links onto a real page with the dialog open.
export const Route = createFileRoute("/_authenticated/app/$team/tutorials")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$team/flows",
      params: { team: params.team },
      search: { guide: "tutorials" },
    });
  },
});
