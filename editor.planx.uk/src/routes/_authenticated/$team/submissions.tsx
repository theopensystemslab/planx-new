import { createFileRoute } from "@tanstack/react-router";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";

export const Route = createFileRoute("/_authenticated/$team/submissions")({
  loader: ({ params }) => {},
  component: Submissions,
});
