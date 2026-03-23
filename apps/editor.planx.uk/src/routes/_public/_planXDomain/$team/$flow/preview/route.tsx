import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  publicRouteSearchSchemas,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/preview",
)({
  validateSearch: zodValidator(publicRouteSearchSchemas.preview),
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("preview", args.context)(args),
  head: createPublicRouteHead("preview"),
  errorComponent: createPublicRouteErrorComponent("preview"),
});
