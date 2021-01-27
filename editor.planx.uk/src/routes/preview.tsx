import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData, withView } from "navi";
import React, { useContext } from "react";
import { useNavigation, View } from "react-navi";

import InformationPage from "../components/InformationPage";
import { dataMerged } from "../lib/dataMergedHotfix";
import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import Preview from "../pages/Preview";
import { FlowMetadata, PreviewContext } from "../pages/Preview/Context";
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

    return (
      <PreviewContext.Provider value={flow}>
        <Preview theme={flow.team.theme}>
          <View />
        </Preview>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions />,
    }),
    // TODO: Extract privacy & help logic because they're essentially the same
    "/privacy": route({
      view: () => {
        // TODO: Navigate back to flow instead of simply "back"
        const navigation = useNavigation();
        const context = useContext(PreviewContext);

        if (!context) throw new NotFoundError();

        return (
          <InformationPage
            header={context.team.settings.design?.privacy?.header}
            content={context.team.settings.design?.privacy?.content}
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
            header={context.team.settings.design?.help?.header}
            content={context.team.settings.design?.help?.content}
            onClose={() => navigation.goBack()}
          />
        );
      },
    }),
  })
);

export default routes;
