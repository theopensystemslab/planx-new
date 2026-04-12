import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  publicRouteSearchSchemas,
} from "utils/routeUtils/publicRouteHelpers";

// TODO: How much of this can live once at a higher level?
export const Route = createFileRoute("/_public/_customDomain/$flow")({
  validateSearch: zodValidator(publicRouteSearchSchemas.published),
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("published", args.context)(args),
  head: createPublicRouteHead("published"),
  errorComponent: createPublicRouteErrorComponent("published"),
});
