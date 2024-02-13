import gql from "graphql-tag";
import { dataMerged } from "lib/dataMergedHotfix";
import { publicClient } from "lib/graphql";
import { NaviRequest } from "navi";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { Flow, GlobalSettings } from "types";

import { getTeamFromDomain } from "../utils";

interface UnpublishedViewData {
  flows: Flow[];
  globalSettings: GlobalSettings[];
}

/**
 * View wrapper for /unpublished routes
 * Does not display Save & Return layout as progress is not persisted on this route
 */
export const unpublishedView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));
  const data = await fetchDataForUnpublishedView(flowSlug, teamSlug);

  const flow = data.flows[0];
  if (!flow) throw new NotFoundError();

  const flowData = await dataMerged(flow.id);

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

const fetchDataForUnpublishedView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<UnpublishedViewData> => {
  try {
    const result = await publicClient.query({
      query: gql`
        query GetUnpublishedData($flowSlug: String!, $teamSlug: String!) {
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
              settings
              integrations {
                hasPlanningData: has_planning_data
              }
              slug
              notifyPersonalisation: notify_personalisation
              boundaryBBox: boundary_bbox
            }
            settings
            slug
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
