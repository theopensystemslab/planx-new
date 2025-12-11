import { NaviRequest, NotFoundError } from "navi";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain, setPath } from "routes/utils";
import { Flow, GlobalSettings } from "types";
import WatermarkBackground from "ui/shared/WatermarkBackground";

import { fetchSettingsForPublishedView, getLastPublishedAt } from "./queries";

export interface PublishedViewSettings {
  flows: PublishedFlow[];
  globalSettings: GlobalSettings[];
}

interface PublishedFlow extends Flow {
  publishedFlows: Record<"data", Store.Flow>[];
}

/**
 * View wrapper for /published and /:flowSlug (on custom domains)
 * Fetches all necessary data, and sets up Save & Return layout
 */
export const publishedView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));
  const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
  const flow = data.flows[0];

  const lastPublishedDate = await getLastPublishedAt(flow.id);
  useStore.setState({ lastPublishedDate });

  if (!flow)
    throw new NotFoundError(`Flow ${flowSlug} not found for ${teamSlug}`);

  const publishedFlow = flow.publishedFlows[0]?.data;
  if (!publishedFlow)
    throw new NotFoundError(`Flow ${flowSlug} not published for ${teamSlug}`);

  setPath(publishedFlow, req);

  const state = useStore.getState();
  // XXX: necessary as long as not every flow is published; aim to remove dataMergedHotfix.ts in future
  // load pre-flattened published flow if exists, else load & flatten flow
  state.setFlow({
    id: flow.id,
    flow: publishedFlow,
    flowSlug,
    flowStatus: flow.status,
    flowSummary: flow.summary,
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
        forceVisibility={false}
      />
      <OfflineLayout>
        <SaveAndReturnLayout>
          <View />
        </SaveAndReturnLayout>
      </OfflineLayout>
    </PublicLayout>
  );
};
