import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { getFlattenedFlowData } from "lib/api/flow/requests";
import { queryClient } from "lib/queryClient";
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
  loader: ({ context }) => {
    queryClient.prefetchQuery({
      queryKey: ["flattenedFlowData", "preview", context.flow.id],
      queryFn: () =>
        getFlattenedFlowData({
          flowId: context.flow.id,
          isDraft: false,
        }),
    })
  },
  head: createPublicRouteHead("preview"),
  errorComponent: createPublicRouteErrorComponent("preview"),
});
