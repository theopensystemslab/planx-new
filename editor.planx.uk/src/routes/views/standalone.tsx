import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { Flow, GlobalSettings } from "types";

import { getTeamFromDomain } from "../utils";

interface StandaloneViewData {
  flows: Pick<Flow, "team" | "settings">[];
  globalSettings: GlobalSettings[];
}

/**
 * View wrapper for standalone routes (e.g. Pay)
 * Fetches all necessary data, and sets up layout for a standalone page
 */
const standaloneView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));
  const data = await fetchDataForStandaloneView(flowSlug, teamSlug);

  const {
    flows: [{ team, settings: flowSettings }],
    globalSettings,
  } = data;

  const state = useStore.getState();
  state.setFlowNameFromSlug(flowSlug);
  state.setGlobalSettings(globalSettings[0]);
  state.setFlowSettings(flowSettings);
  state.setTeam(team);

  return (
    <PublicLayout>
      <View />
    </PublicLayout>
  );
};

const fetchDataForStandaloneView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<StandaloneViewData> => {
  try {
    const result = await publicClient.query({
      query: gql`
        query GetStandaloneData($flowSlug: String!, $teamSlug: String!) {
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
                primary: primary_colour
                secondary: secondary_colour
                logo
                favicon
              }
              name
              settings
              slug
              notifyPersonalisation: notify_personalisation
              boundaryBBox: boundary_bbox
            }
            settings
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

export default standaloneView;
