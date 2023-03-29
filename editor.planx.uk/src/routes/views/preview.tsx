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

export const previewView = async (req: NaviRequest) => {
  const flowSlug = req.params.flow.split(",")[0];
  const externalTeamName = await getTeamFromDomain(window.location.hostname);

  // XXX: Prevents accessing a different team than the one associated with the custom domain.
  //      e.g. Custom domain is for Southwark but URL is looking for Lambeth
  //      e.g. https://planningservices.southwark.gov.uk/lambeth/some-flow/preview
  if (
    req.params.team &&
    externalTeamName &&
    externalTeamName !== req.params.team
  )
    throw new NotFoundError();

  const { data } = await client.query({
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
      teamSlug: req.params.team || externalTeamName,
    },
  });

  const flow: Flow = data.flows[0];

  const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
    data.globalSettings[0]
  );

  if (!flow) throw new NotFoundError();

  const publishedFlow: Flow = data.flows[0].publishedFlows[0]?.data;

  const flowData = publishedFlow ? publishedFlow : await dataMerged(flow.id);

  setPath(flowData, req);

  // XXX: necessary as long as not every flow is published; aim to remove dataMergedHotfix.ts in future
  // load pre-flattened published flow if exists, else load & flatten flow
  useStore.getState().setFlow({ id: flow.id, flow: flowData, flowSlug });

  return (
    <PublicLayout
      team={flow.team}
      footerContent={globalSettings?.footerContent}
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
