import gql from "graphql-tag";
import { client } from "lib/graphql";
import { useStore } from "pages/FlowEditor/lib/store";
import { Flow, GlobalSettings } from "types";

import { getTeamFromDomain } from "./utils";

interface StandaloneViewData {
  flows: Pick<Flow, "name" | "team" | "settings">[];
  globalSettings: GlobalSettings[];
}

export const fetchDataForStandaloneView = async (
  flowParam: string,
  teamParam?: string,
): Promise<StandaloneViewData> => {
  const flowSlug = flowParam.split(",")[0];
  const teamSlug =
    teamParam || (await getTeamFromDomain(window.location.hostname));

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

    if (!result.data.flows.length) {
      throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
    }

    return result.data;
  } catch (error) {
    console.error("Failed to fetch standalone view data:", error);
    throw error;
  }
};

export const setupStandaloneViewStore = (data: StandaloneViewData): void => {
  const {
    flows: [{ name, team, settings: flowSettings }],
    globalSettings,
  } = data;

  useStore.setState({ flowName: name });

  const state = useStore.getState();
  state.setGlobalSettings(globalSettings[0]);
  state.setFlowSettings(flowSettings);
  state.setTeam(team);
};
