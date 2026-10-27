import { createFileRoute } from "@tanstack/react-router";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  prefetchPublishedFlowData,
} from "utils/routeUtils/publicRouteHelpers";
import { publicRouteSearchSchemas } from "utils/routeUtils/publicRouteSearchSchemas";

// TODO: How much of this can live once at a higher level?
export const Route = createFileRoute("/_public/_customDomain/$flow")({
  validateSearch: publicRouteSearchSchemas.published,
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("published", args.context)(args),
  loader: (args) => prefetchPublishedFlowData(args),
  head: createPublicRouteHead("published"),
  errorComponent: createPublicRouteErrorComponent("published"),
});
