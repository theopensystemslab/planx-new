import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "pages/ErrorPage/ErrorPage";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/pay/invite/failed",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ErrorPage title="Failed to generate payment request" />;
}
