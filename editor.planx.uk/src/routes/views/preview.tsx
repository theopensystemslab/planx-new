import { FlowGraph } from "@opensystemslab/planx-core/types";
import axios, { AxiosError } from "axios";
import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain } from "routes/utils";

import { fetchSettingsForPublishedView } from "./published";

/**
 * View wrapper for /amber (in future /preview)
 * Does not display Save & Return layout as progress is not persisted on this route
 */
export const previewView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));

  // /amber uses the same theme & global settings as /published
  const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
  const flow = data.flows[0];
  if (!flow)
    throw new NotFoundError(`Flow ${flowSlug} not found for ${teamSlug}`);

  // /amber fetches draft data of this flow and the latest published version of each external portal
  const flowData = await fetchFlattenedFlowData(flow.id);

  const state = useStore.getState();
  state.setFlow({ id: flow.id, flow: flowData, flowSlug });
  state.setFlowNameFromSlug(flowSlug);
  state.setGlobalSettings(data.globalSettings[0]);
  state.setFlowSettings(flow.settings);
  state.setTeam(flow.team);

  return (
    <PublicLayout>
      <View />
    </PublicLayout>
  );
};

const fetchFlattenedFlowData = async (flowId: string): Promise<FlowGraph> => {
  const url = `${process.env.REACT_APP_API_URL}/flows/${flowId}/flatten-data`;
  try {
    const { data } = await axios.get<FlowGraph>(url);
    return data;
  } catch (error) {
    console.log(error);
    if (error instanceof AxiosError) {
      alert(
        `Cannot open this view, navigate back to the graph to keep editing. \n\n${error.response?.data?.error}`,
      );
    }
    throw new NotFoundError();
  }
};
