import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import SubmissionDetailModal from "pages/FlowEditor/components/Submissions/components/SubmissionDetailModal";

export const Route = createFileRoute(
  "/_authenticated/app/$team/submissions/$sessionId",
)({
  loader: async ({ params }) => ({
    sessionId: params.sessionId,
  }),
  pendingComponent: DelayedLoadingIndicator,
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useLoaderData();
  return <SubmissionDetailModal sessionId={sessionId} />;
}
