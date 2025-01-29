import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
import { NaviRequest, NotFoundError } from "navi";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain, setPath } from "routes/utils";
import { Flow, GlobalSettings } from "types";

interface PublishedViewSettings {
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
    flowName: flow.name,
  });

  state.setGlobalSettings(data.globalSettings[0]);
  state.setFlowSettings(flow.settings);
  state.setTeam(flow.team);

  return (
    <PublicLayout>
      <OfflineLayout>
        <SaveAndReturnLayout>
          <View />
        </SaveAndReturnLayout>
      </OfflineLayout>
    </PublicLayout>
  );
};

export const fetchSettingsForPublishedView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<PublishedViewSettings> => {
  try {
    const result = await publicClient.query({
      query: gql`
        query GetSettingsForPublishedView(
          $flowSlug: String!
          $teamSlug: String!
        ) {
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
            status
            publishedFlows: published_flows(
              limit: 1
              order_by: { created_at: desc }
            ) {
              data
            }
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

export const getLastPublishedAt = async (flowId: string): Promise<string> => {
  try {
    const { data } = await publicClient.query({
      query: gql`
        query GetLastPublishedFlow($id: uuid) {
          flows(limit: 1, where: { id: { _eq: $id } }) {
            published_flows(order_by: { created_at: desc }, limit: 1) {
              created_at
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
    });
    return data.flows[0].published_flows[0].created_at;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};
