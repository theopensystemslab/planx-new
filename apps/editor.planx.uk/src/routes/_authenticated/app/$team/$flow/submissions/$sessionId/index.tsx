import { createFileRoute } from "@tanstack/react-router";
import SubmissionDetailModal from "pages/FlowEditor/components/Submissions/components/SubmissionDetailModal";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions/$sessionId/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useParams();
  return <SubmissionDetailModal sessionId={sessionId} />;
}
