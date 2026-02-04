import { createFileRoute } from "@tanstack/react-router";
import ApplicationViewer from "pages/Preview/ApplicationViewer";

export const Route = createFileRoute(
  "/_public/_customDomain/$flow/pay/view-application",
)({
  beforeLoad: ({ context }) => {
    return {
      ...context,
      isViewApplicationPage: true,
    };
  },
  component: ApplicationViewer,
});
