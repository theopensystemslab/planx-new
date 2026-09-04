import { createFileRoute } from "@tanstack/react-router";
import SubmissionHTML from "pages/FlowEditor/components/Submissions/components/SubmissionHTML";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions/$sessionId",
)({
  validateSearch: () => ({}),
  loader: async ({ params }) => ({
    sessionId: params.sessionId,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useLoaderData();
  return <SubmissionHTML sessionId={sessionId} />;
}
