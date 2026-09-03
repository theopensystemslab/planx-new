import { createFileRoute, notFound } from "@tanstack/react-router";
import SubmissionDetailModal from "pages/FlowEditor/components/Submissions/components/SubmissionDetailModal";
import SubmissionsGrouped from "pages/FlowEditor/components/Submissions/Submissions";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/submissions/",
)({
  loader: async ({ params }) => {
    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { detail } = Route.useSearch();
  const { flow } = Route.useParams();

  return (
    <>
      <SubmissionsGrouped flowSlug={flow} />
      {detail && <SubmissionDetailModal sessionId={detail} />}
    </>
  );
}
