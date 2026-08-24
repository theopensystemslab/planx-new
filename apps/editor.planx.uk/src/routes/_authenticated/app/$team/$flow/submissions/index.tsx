import { createFileRoute } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import SubmissionDetailModal from "pages/FlowEditor/components/Submissions/components/SubmissionDetailModal";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import SubmissionsGrouped from "pages/FlowEditor/components/Submissions/SubmissionsGrouped";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { detail } = Route.useSearch();
  const { flow } = Route.useParams();

  const SubmissionsWrapper = hasFeatureFlag("GROUPED_SUBMISSIONS")
    ? SubmissionsGrouped
    : Submissions;

  return (
    <>
      <SubmissionsWrapper flowSlug={flow} />
      {detail && <SubmissionDetailModal sessionId={detail} />}
    </>
  );
}
