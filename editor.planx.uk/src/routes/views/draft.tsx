import { FlowGraph } from "@opensystemslab/planx-core/types";
import axios from "axios";
import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { Flow, GlobalSettings } from "types";

import { getTeamFromDomain } from "../utils";

interface DraftSettings {
  flows: Flow[];
  globalSettings: GlobalSettings[];
}

/**
 * View wrapper for /draft route
 * Does not display Save & Return layout as progress is not persisted on this route
 */
export const draftView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));

  const data = await fetchSettingsForDraftView(flowSlug, teamSlug);
  const flow = data.flows[0];
  if (!flow) throw new NotFoundError();

  const flowData = await fetchDraftFlattenedFlowData(flow.id);

  const state = useStore.getState();
  state.setFlow({ id: flow.id, flow: flowData, flowSlug, flowName: flow.name });
  state.setGlobalSettings(data.globalSettings[0]);
  state.setFlowSettings(flow.settings);
  state.setTeam(flow.team);

  return (
    <PublicLayout>
      <View />
    </PublicLayout>
  );
};

const fetchSettingsForDraftView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<DraftSettings> => {
  try {
    const result = await publicClient.query({
      query: gql`
        query GetSettingsForDraftView($flowSlug: String!, $teamSlug: String!) {
          flows(
            limit: 1
            where: {
              slug: { _eq: $flowSlug }
              team: { slug: { _eq: $teamSlug } }
            }
          ) {
            id
            team {
              theme {
                primaryColour: primary_colour
                actionColour: action_colour
                linkColour: link_colour
                logo
                favicon
              }
              name
              settings: team_settings {
                boundaryUrl: boundary_url
                boundaryBBox: boundary_bbox
                homepage
                helpEmail: help_email
                helpPhone: help_phone
                helpOpeningHours: help_opening_hours
                emailReplyToId: email_reply_to_id
                boundaryBBox: boundary_bbox
              }
              integrations {
                hasPlanningData: has_planning_data
              }
              slug
            }
            settings
            slug
            name
          }
          globalSettings: global_settings {
            footerContent: footer_content
          }
        }
      `,
      variables: {
        flowSlug,
        teamSlug,
      },
    });
    return result.data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

const fetchDraftFlattenedFlowData = async (
  flowId: string,
): Promise<FlowGraph> => {
  const url = `${
    import.meta.env.VITE_APP_API_URL
  }/flows/${flowId}/flatten-data?draft=true`;
  try {
    const { data } = await axios.get<FlowGraph>(url);
    return data;
  } catch (error) {
    console.log(error);
    throw new NotFoundError();
  }
};
