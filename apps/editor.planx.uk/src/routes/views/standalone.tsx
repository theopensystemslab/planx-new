import gql from "graphql-tag";
import { client } from "lib/graphql";
import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { Flow, GlobalSettings } from "types";
import Main from "ui/shared/Main";

import { getTeamFromDomain } from "../utils";

interface StandaloneViewData {
  flows: Pick<Flow, "name" | "team" | "settings">[];
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
    flows: [{ name, team, settings: flowSettings }],
    globalSettings,
  } = data;

  useStore.setState({ flowName: name });

  const state = useStore.getState();
  state.setGlobalSettings(globalSettings[0]);
  state.setFlowSettings(flowSettings);
  state.setTeam(team);

  return (
    <PublicLayout>
      <Main>
        <View />
      </Main>
    </PublicLayout>
  );
};

const fetchDataForStandaloneView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<StandaloneViewData> => {
  try {
    const result = await client.query({
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
            name
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
      context: { role: "public" },
    });
    return result.data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

export default standaloneView;
