import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import SubmissionsGrouped from "pages/FlowEditor/components/Submissions/SubmissionsGrouped";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions",
)({
  pendingMs: Infinity,
  component: SubmissionsLayout,
});

function SubmissionsLayout() {
  const { flow } = Route.useParams();
  const matchRoute = useMatchRoute();
  const isDetailRoute = matchRoute({
    to: "/app/$team/$flow/submissions/$sessionId/detail",
    fuzzy: true,
  });

  const SubmissionsWrapper = hasFeatureFlag("GROUPED_SUBMISSIONS")
    ? SubmissionsGrouped
    : Submissions;

  return (
    <>
      {!isDetailRoute && <SubmissionsWrapper flowSlug={flow} />}
      <Outlet />
    </>
  );
}
