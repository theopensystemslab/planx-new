import camelcaseKeys from "camelcase-keys";
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
import type { Flow, GlobalSettings, Maybe } from "types";

const routes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  withView(async (req) => {
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
            }
            settings
            published_flows(limit: 1, order_by: { id: desc }) {
              data
            }
          }

          global_settings {
            footer_content
          }
        }
      `,
      variables: {
        flowSlug: req.params.flow.split(",")[0],
        teamSlug: req.params.team,
      },
    });

    const flow: Flow = data.flows[0];

    const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
      data.global_settings[0]
    );

    if (!flow) throw new NotFoundError();

    const publishedFlow: Flow = data.flows[0].published_flows[0]?.data;

    // XXX: necessary as long as not every flow is published; aim to remove dataMergedHotfix.ts in future
    // load pre-flattened published flow if exists, else load & flatten flow
    useStore
      .getState()
      .setFlow(
        flow.id,
        publishedFlow ? publishedFlow : await dataMerged(flow.id)
      );

    // TODO: Replace with below after merging
    // https://github.com/theopensystemslab/planx-new/pull/116
    // useStore.getState().setFlow(flow.id, flow.data_merged);

    return (
      <PreviewContext.Provider value={{ flow, globalSettings }}>
        <Layout
          theme={flow.team.theme}
          settings={flow.settings}
          footerContent={globalSettings?.footerContent}
        >
          <View />
        </Layout>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions />,
    }),
    "/pages/:page": map((req) => {
      return route({
        view: () => <ContentPage page={req.params.page} />,
      });
    }),
  })
);

export default routes;
