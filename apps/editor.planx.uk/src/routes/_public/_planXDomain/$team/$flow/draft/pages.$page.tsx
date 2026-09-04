import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "pages/Preview/ContentPage";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/draft/pages/$page",
)({
  beforeLoad: () => ({
    isContentPage: true,
  }),
  component: DraftPageComponent,
});

function DraftPageComponent() {
  const { page } = Route.useParams();
  return <ContentPage page={page} />;
}
