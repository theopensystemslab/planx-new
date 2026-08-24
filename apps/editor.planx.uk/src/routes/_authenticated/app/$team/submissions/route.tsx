import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import SubmissionsGrouped from "pages/FlowEditor/components/Submissions/SubmissionsGrouped";

export const Route = createFileRoute("/_authenticated/app/$team/submissions")({
  pendingMs: Infinity,
  component: SubmissionsLayout,
});

function SubmissionsLayout() {
  const matchRoute = useMatchRoute();
  const isDetailRoute = matchRoute({
    to: "/app/$team/submissions/$sessionId/detail",
    fuzzy: true,
  });

  const SubmissionsWrapper = hasFeatureFlag("GROUPED_SUBMISSIONS")
    ? SubmissionsGrouped
    : Submissions;

  return (
    <>
      {!isDetailRoute && <SubmissionsWrapper />}
      <Outlet />
    </>
  );
}
