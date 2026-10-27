import { createFileRoute } from "@tanstack/react-router";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  prefetchPublishedFlowData,
} from "utils/routeUtils/publicRouteHelpers";
import { publicRouteSearchSchemas } from "utils/routeUtils/publicRouteSearchSchemas";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/published",
)({
  validateSearch: publicRouteSearchSchemas.published,
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("published", args.context)(args),
  loader: (args) => prefetchPublishedFlowData(args),
  head: createPublicRouteHead("published"),
  errorComponent: createPublicRouteErrorComponent("published"),
});
