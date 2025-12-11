import { getFlattenedFlowData } from "lib/api/flow/requests";
import { queryClient } from "lib/queryClient";
import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import { TestWarningPage } from "pages/Preview/TestWarningPage";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain } from "routes/utils";
import WatermarkBackground from "ui/shared/WatermarkBackground";

import { fetchSettingsForPublishedView } from "./published/queries";

/**
 * View wrapper for /preview
 * Does not display Save & Return layout as progress is not persisted on this route
 */
export const previewView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));

  // /preview uses the same theme & global settings as /published
  const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
  const flow = data.flows[0];
  if (!flow)
    throw new NotFoundError(`Flow ${flowSlug} not found for ${teamSlug}`);

  const flowData = await queryClient.ensureQueryData({
    queryKey: ["flattenedFlowData", "preview", flow.id],
    queryFn: () => getFlattenedFlowData({ flowId: flow.id }),
  });

  const state = useStore.getState();
  state.setFlow({
    id: flow.id,
    flow: flowData,
    flowSlug,
    flowName: flow.name,
  });
  state.setGlobalSettings(data.globalSettings[0]);
  state.setFlowSettings(flow.settings);
  state.setTeam(flow.team);

  return (
    <PublicLayout>
      <WatermarkBackground
        variant="dark"
        opacity={0.05}
        forceVisibility={true}
      />
      <TestWarningPage>
        <View />
      </TestWarningPage>
    </PublicLayout>
  );
};
