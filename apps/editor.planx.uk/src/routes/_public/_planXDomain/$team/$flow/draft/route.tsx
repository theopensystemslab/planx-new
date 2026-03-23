import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  publicRouteSearchSchemas,
} from "utils/routeUtils/publicRouteHelpers";

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/draft")(
  {
    validateSearch: zodValidator(publicRouteSearchSchemas.draft),
    beforeLoad: (args) =>
      createPublicRouteBeforeLoad("draft", args.context)(args),
    head: createPublicRouteHead("draft"),
    errorComponent: createPublicRouteErrorComponent("draft"),
  },
);
