import { createFileRoute } from "@tanstack/react-router";
import { client } from "lib/graphql";
import VisibilitySettings from "pages/FlowEditor/components/Settings/Flow/Visibility";
import { GET_FLOW_STATUS } from "pages/FlowEditor/components/Settings/Flow/Visibility/FlowStatus/queries";
import type { GetFlowStatus } from "pages/FlowEditor/components/Settings/Flow/Visibility/FlowStatus/types";
import { useStore } from "pages/FlowEditor/lib/store";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/settings/visibility",
)({
  loader: async () => {
    const flowId = useStore.getState().id;

    const { data } = await client.query<GetFlowStatus>({
      query: GET_FLOW_STATUS,
      variables: { flowId },
      fetchPolicy: "network-only",
    });

    return {
      flowStatusData: data,
    };
  },
  component: VisibilitySettings,
});
