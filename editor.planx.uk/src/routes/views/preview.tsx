import camelcaseKeys from "camelcase-keys";
import gql from "graphql-tag";
import { dataMerged } from "lib/dataMergedHotfix";
import { client } from "lib/graphql";
import { NaviRequest } from "navi";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import { View } from "react-navi";
import { getTeamFromDomain, setPath } from "routes/utils";
import { Flow, GlobalSettings, Maybe } from "types";

interface PublishedViewData {
  flows: Flow[];
  publishedFlows: Record<"data", Flow>[];
  globalSettings: GlobalSettings[];
}

/**
 * View wrapper for /preview and /:flowSlug (on custom domains)
 * Fetches all necessary data, and sets up Save & Return layout
 */
export const previewView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const teamSlug =
    req.params.team || (await getTeamFromDomain(window.location.hostname));
  const data = await fetchDataForPublishedView(flowSlug, teamSlug);

  const {
    flows: [flow],
    publishedFlows: [{ data: publishedFlow }],
    globalSettings: [{ footerContent }],
  } = data;

  if (!flow) throw new NotFoundError();

  const flowData = publishedFlow ? publishedFlow : await dataMerged(flow.id);

  setPath(flowData, req);

  // XXX: necessary as long as not every flow is published; aim to remove dataMergedHotfix.ts in future
  // load pre-flattened published flow if exists, else load & flatten flow
  useStore.getState().setFlow({ id: flow.id, flow: flowData, flowSlug });

  const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
    data.globalSettings[0]
  );

  return (
    <PublicLayout
      team={flow.team}
      footerContent={footerContent}
      settings={flow.settings}
      globalSettings={globalSettings}
      flow={flow}
    >
      <SaveAndReturnLayout>
        <View />
      </SaveAndReturnLayout>
    </PublicLayout>
  );
};

const fetchDataForPublishedView = async (
  flowSlug: string,
  teamSlug: string
): Promise<PublishedViewData> => {
  try {
    const result = await client.query({
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
              theme
              name
              settings
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
    console.error();
    throw new NotFoundError();
  }
};
