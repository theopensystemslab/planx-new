import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData, withView } from "navi";
import React, { useContext } from "react";
import { useNavigation, View } from "react-navi";

import InformationPage from "../components/InformationPage";
import { dataMerged } from "../lib/dataMergedHotfix";
import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import { FlowMetadata, PreviewContext } from "../pages/Preview/Context";
import Layout from "../pages/Preview/PreviewLayout";
import Questions from "../pages/Preview/Questions";

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
              settings
            }
          }
        }
      `,
      variables: {
        flowSlug: req.params.flow.split(",")[0],
        teamSlug: req.params.team,
      },
    });

    const flow: FlowMetadata = data.flows[0];

    if (!flow) throw new NotFoundError();

    useStore.getState().setFlow(flow.id, await dataMerged(flow.id));
    // TODO: Replace with below after merging	    return (
    // https://github.com/theopensystemslab/planx-new/pull/116
    //
    // useStore.getState().setFlow(flow.id, flow.data_merged);

    return (
      <PreviewContext.Provider value={flow}>
        <Layout theme={flow.team.theme} settings={flow.team.settings?.design}>
          <View />
        </Layout>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions />,
    }),
    "/privacy": route({
      view: () => {
        const navigation = useNavigation();
        const context = useContext(PreviewContext);

        if (!context) throw new NotFoundError();

        return (
          <InformationPage
            heading={context.team.settings?.design?.privacy?.heading}
            content={context.team.settings?.design?.privacy?.content}
            onClose={() => navigation.goBack()}
          />
        );
      },
    }),
    "/help": route({
      view: () => {
        const navigation = useNavigation();
        const context = useContext(PreviewContext);

        if (!context) throw new NotFoundError();

        return (
          <InformationPage
            heading={context.team.settings?.design?.help?.heading}
            content={context.team.settings?.design?.help?.content}
            onClose={() => navigation.goBack()}
          />
        );
      },
    }),
  })
);

export default routes;
