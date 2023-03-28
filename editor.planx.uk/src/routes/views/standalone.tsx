import camelcaseKeys from "camelcase-keys";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { NaviRequest, NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import PublicLayout from "pages/layout/PublicLayout";
import React from "react";
import { View } from "react-navi";
import { GlobalSettings, Maybe } from "types";

import { getTeamFromDomain } from "../utils";

/**
 * Docs: What exactly is this??
 */
const standaloneView = async (req: NaviRequest) => {
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
            theme
            name
            settings
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

  const {
    flows: [{ team, settings }],
    globalSettings: { footerContent },
  } = data;

  const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
    data.globalSettings[0]
  );

  useStore.getState().setFlowNameFromSlug(flowSlug);

  return (
    <PublicLayout
      team={team}
      footerContent={footerContent}
      settings={settings}
      context="Pay"
      globalSettings={globalSettings}
    >
      <View />
    </PublicLayout>
  );
};

export default standaloneView;
