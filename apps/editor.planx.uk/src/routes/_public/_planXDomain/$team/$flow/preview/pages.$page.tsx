import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "pages/Preview/ContentPage";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/preview/pages/$page",
)({
  beforeLoad: () => ({
    isContentPage: true,
  }),
  component: PreviewPageComponent,
});

function PreviewPageComponent() {
  const { page } = Route.useParams();
  return <ContentPage page={page} />;
}
