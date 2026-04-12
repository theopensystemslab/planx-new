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

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/draft")(
  {
    validateSearch: zodValidator(publicRouteSearchSchemas.draft),
    beforeLoad: (args) =>
      createPublicRouteBeforeLoad("draft", args.context)(args),
      loader: ({ context }) => {
        queryClient.prefetchQuery({
          queryKey: ["flattenedFlowData", "draft", context.flow.id],
          queryFn: () =>
            getFlattenedFlowData({
              flowId: context.flow.id,
              isDraft: true,
            }),
        })
      },
    head: createPublicRouteHead("draft"),
    errorComponent: createPublicRouteErrorComponent("draft"),
  },
);
