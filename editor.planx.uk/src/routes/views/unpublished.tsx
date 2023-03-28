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

export const unpublishedView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const externalTeamName = await getTeamFromDomain(window.location.hostname);

  const { data } = await client.query({
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
        }

        globalSettings: global_settings {
          footerContent: footer_content
        }
      }
    `,
    variables: {
      flowSlug,
      teamSlug: req.params.team || externalTeamName,
    },
  });

  const flow: Flow = data.flows[0];

  const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
    data.globalSettings[0]
  );

  if (!flow) throw new NotFoundError();

  const flowData = await dataMerged(flow.id);
  useStore.getState().setFlow({ id: flow.id, flow: flowData, flowSlug });

  return (
    <PublicLayout
      team={flow.team}
      footerContent={globalSettings?.footerContent}
      settings={flow.settings}
      context="Preview"
      globalSettings={globalSettings}
      flow={flow}
    >
      <View />
    </PublicLayout>
  );
};
