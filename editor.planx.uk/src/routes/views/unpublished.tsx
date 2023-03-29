import camelcaseKeys from "camelcase-keys";
import gql from "graphql-tag";
import { dataMerged } from "lib/dataMergedHotfix";
import { client } from "lib/graphql";
import { NaviRequest } from "navi";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { Flow, GlobalSettings, Maybe } from "types";

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
  useStore.getState().setFlow({ id: flow.id, flow: flowData, flowSlug });

  const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
    data.globalSettings[0]
  );

  return (
    <PublicLayout
      team={flow.team}
      footerContent={globalSettings?.footerContent}
      flowSettings={flow.settings}
      globalSettings={globalSettings}
    >
      <View />
    </PublicLayout>
  );
};

const fetchDataForUnpublishedView = async (
  flowSlug: string,
  teamSlug: string
): Promise<UnpublishedViewData> => {
  try {
    const result = await client.query({
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
              theme
              name
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
