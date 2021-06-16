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
import type { Flow } from "../types";

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
          }
        }
      `,
      variables: {
        flowSlug: req.params.flow.split(",")[0],
        teamSlug: req.params.team,
      },
    });

    const flow: Flow = data.flows[0];

    if (!flow) throw new NotFoundError();

    useStore.getState().setFlow(flow.id, await dataMerged(flow.id));
    // TODO: Replace with below after merging	    return (
    // https://github.com/theopensystemslab/planx-new/pull/116
    //
    // useStore.getState().setFlow(flow.id, flow.data_merged);

    return (
      <PreviewContext.Provider value={flow}>
        <Layout theme={flow.team.theme} settings={flow.settings}>
          <View />
        </Layout>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions />,
    }),
    "/:page": map((req) => {
      return route({
        view: () => {
          const navigation = useNavigation();
          const context = useContext(PreviewContext);

          if (
            !context?.settings?.elements ||
            !context.settings?.elements[req.params.page]?.show
          )
            throw new NotFoundError();

          return (
            <InformationPage
              heading={context.settings?.elements[req.params.page]?.heading}
              content={context.settings?.elements[req.params.page]?.content}
              onClose={() => navigation.goBack()}
            />
          );
        },
      });
    }),
  })
);

export default routes;
