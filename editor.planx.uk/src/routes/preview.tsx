import gql from "graphql-tag";
import {
  compose,
  map,
  mount,
  NotFoundError,
  route,
  withData,
  withView,
} from "navi";
import React, { useContext } from "react";
import { useNavigation, View } from "react-navi";

import InformationPage from "../components/InformationPage";
import { dataMerged } from "../lib/dataMergedHotfix";
import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import { PreviewContext } from "../pages/Preview/Context";
import Layout from "../pages/Preview/PreviewLayout";
import Questions from "../pages/Preview/Questions";
import { Flow, FOOTER_ITEMS } from "../types";

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

    const globalContent = data.global_settings[0]?.footer_content;

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
      <PreviewContext.Provider value={{ flow, globalContent }}>
        <Layout
          theme={flow.team.theme}
          settings={flow.settings}
          globalContent={globalContent}
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
        view: () => {
          const navigation = useNavigation();
          const context = useContext(PreviewContext);

          const validateFlowSetting = () => {
            const flowSetting =
              context?.flow.settings?.elements?.[req.params.page];

            if (!flowSetting?.show) return;

            return {
              heading: flowSetting.heading,
              content: flowSetting.content,
            };
          };

          const content = FOOTER_ITEMS.includes(req.params.page)
            ? validateFlowSetting()
            : context?.globalContent?.[req.params.page];

          if (!content) throw new NotFoundError();

          return (
            <InformationPage {...content} onClose={() => navigation.goBack()} />
          );
        },
      });
    }),
  })
);

export default routes;
