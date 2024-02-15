import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
import { NaviRequest } from "navi";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import { Store } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain, setPath } from "routes/utils";
import { Flow, GlobalSettings } from "types";

interface PublishedViewData {
  flows: PreviewFlow[];
  globalSettings: GlobalSettings[];
}

interface PreviewFlow extends Flow {
  publishedFlows: Record<"data", Store.flow>[];
}

/**
 * View wrapper for /preview and /:flowSlug (on custom domains)
 * Fetches all necessary data, and sets up Save & Return layout
 */
export const publishedView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));
  const data = await fetchDataForPublishedView(flowSlug, teamSlug);

  const flow = data.flows[0];
  if (!flow)
    throw new NotFoundError(`Flow ${flowSlug} not found for ${teamSlug}`);

  const publishedFlow = flow.publishedFlows[0]?.data;
  if (!publishedFlow)
    throw new NotFoundError(`Flow ${flowSlug} not published for ${teamSlug}`);

  setPath(publishedFlow, req);

  const state = useStore.getState();
  // XXX: necessary as long as not every flow is published; aim to remove dataMergedHotfix.ts in future
  // load pre-flattened published flow if exists, else load & flatten flow
  state.setFlow({ id: flow.id, flow: publishedFlow, flowSlug });
  state.setGlobalSettings(data.globalSettings[0]);
  state.setFlowSettings(flow.settings);
  state.setTeam(flow.team);

  return (
    <PublicLayout>
      <SaveAndReturnLayout>
        <View />
      </SaveAndReturnLayout>
    </PublicLayout>
  );
};

const fetchDataForPublishedView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<PublishedViewData> => {
  try {
    const result = await publicClient.query({
      query: gql`
        query GetPreviewData($flowSlug: String!, $teamSlug: String!) {
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
