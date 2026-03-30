import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { client } from "lib/graphql";
import {
  createPublicRouteBeforeLoad,
  createPublicRouteErrorComponent,
  createPublicRouteHead,
  publicRouteSearchSchemas,
} from "utils/routeUtils/publicRouteHelpers";
import { GET_PUBLISHED_FLOW_DATA } from "utils/routeUtils/publishedQueries";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/published",
)({
  validateSearch: zodValidator(publicRouteSearchSchemas.published),
  beforeLoad: (args) =>
    createPublicRouteBeforeLoad("published", args.context)(args),
  loader: ({ context }) => {
    // Prefetch flow data. Do not await - just kick off request.
    // Child <PublishedFlow/> component will await data if not yet loaded
    client.query({
      query: GET_PUBLISHED_FLOW_DATA,
      variables: { flowId: context.flow.id },
      context: { role: "public" },
    });
  },
  head: createPublicRouteHead("published"),
  errorComponent: createPublicRouteErrorComponent("published"),
});
