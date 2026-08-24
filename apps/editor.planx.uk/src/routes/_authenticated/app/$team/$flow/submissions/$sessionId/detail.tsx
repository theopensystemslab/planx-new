import { createFileRoute } from "@tanstack/react-router";
import SubmissionHTML from "pages/FlowEditor/components/Submissions/components/SubmissionHTML";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions/$sessionId/detail",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useParams();
  return <SubmissionHTML sessionId={sessionId} />;
}
