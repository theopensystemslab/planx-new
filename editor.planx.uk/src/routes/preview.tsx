import camelcaseKeys from "camelcase-keys";
import { HeaderVariant } from "components/Header";
import gql from "graphql-tag";
import { dataMerged } from "lib/dataMergedHotfix";
import { client } from "lib/graphql";
import {
  compose,
  map,
  mount,
  NotFoundError,
  route,
  withData,
  withView,
} from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import ContentPage from "pages/Preview/ContentPage";
import { PreviewContext } from "pages/Preview/Context";
import Layout from "pages/Preview/PreviewLayout";
import Questions from "pages/Preview/Questions";
import React from "react";
import { View } from "react-navi";
import { Flow, GlobalSettings, Maybe } from "types";

import { getTeamFromDomain, setPath } from "./utils";

const routes = compose(
  withData(async (req) => {
    const externalDomainTeam = await getTeamFromDomain(
      window.location.hostname
    );

    return {
      mountpath: req.mountpath,
      team: req.params.team || externalDomainTeam,
      isPreviewOnlyDomain: Boolean(externalDomainTeam),
    };
  }),

  withView(async (req) => {
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
        query GetFlow($flowSlug: String!, $teamSlug: String!) {
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
            published_flows(limit: 1, order_by: { created_at: desc }) {
              data
            }
          }

          global_settings {
            footer_content
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
      data.global_settings[0]
    );

    if (!flow) throw new NotFoundError();

    const publishedFlow: Flow = data.flows[0].published_flows[0]?.data;

    const flowData = publishedFlow ? publishedFlow : await dataMerged(flow.id);

    setPath(flowData, req);

    // XXX: necessary as long as not every flow is published; aim to remove dataMergedHotfix.ts in future
    // load pre-flattened published flow if exists, else load & flatten flow
    useStore.getState().setFlow({ id: flow.id, flow: flowData, flowSlug });
    useStore.getState().initNavigationStore();

    return (
      <PreviewContext.Provider value={{ flow, globalSettings }}>
        <Layout
          team={flow.team}
          settings={flow.settings}
          footerContent={globalSettings?.footerContent}
          headerVariant={HeaderVariant.Preview}
        >
          <View />
        </Layout>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions previewEnvironment="standalone" />,
    }),
    "/pages/:page": map((req) => {
      return route({
        view: () => <ContentPage page={req.params.page} />,
        data: { isContentPage: true },
      });
    }),
  })
);

export default routes;
