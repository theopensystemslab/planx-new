import { createFileRoute, Outlet } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { hasFeatureFlag } from "lib/featureFlags";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import SubmissionsGrouped from "pages/FlowEditor/components/Submissions/SubmissionsGrouped";

export const Route = createFileRoute("/_authenticated/app/$team/submissions")({
  pendingComponent: DelayedLoadingIndicator,
  component: SubmissionsGroupedLayout,
});

function SubmissionsGroupedLayout() {
  const SubmissionsWrapper = hasFeatureFlag("GROUPED_SUBMISSIONS")
    ? SubmissionsGrouped
    : Submissions;

  return (
    <>
      <SubmissionsWrapper />
      <Outlet />
    </>
  );
}
