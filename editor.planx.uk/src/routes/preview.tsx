import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData, withView } from "navi";
import React from "react";
import { useCurrentRoute,View } from "react-navi";

import Modal from "../components/InformationalModal";
import { dataMerged } from "../lib/dataMergedHotfix";
import { client } from "../lib/graphql";
import { componentOutput, useStore } from "../pages/FlowEditor/lib/store";
import Preview from "../pages/Preview";
import { PreviewContext } from "../pages/Preview/Context";
import Node from "../pages/Preview/Node";

const Questions = () => {
  const [currentCard, record] = useStore((state) => [
    state.currentCard,
    state.record,
  ]);
  const node = currentCard();

  if (!node) return null;

  return (
    <Node
      node={node}
      key={node.id}
      handleSubmit={(values: componentOutput) => {
        record(node.id, values);
      }}
    />
  );
};

const routes = compose(
  withData((req) => {
    console.log("withData");

    return {
      mountpath: req.mountpath,
    };
  }),

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

    const flow = data.flows[0];

    if (!flow) throw new NotFoundError();

    useStore.getState().setFlow(flow.id, await dataMerged(flow.id));

    return (
      <PreviewContext.Provider value={flow}>
        <Preview theme={flow.team.theme} settings={flow.team.settings}>
          <View />
        </Preview>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions />,
    }),
    "/privacy": route({
      getData: async (req) => {
        // TODO: extract this into a nice function because this is getting cluttered
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
                team {
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

        const settings = data.flows[0].team.settings.design.privacy;
        return { settings };
      },
      view: (req: any) => {
        const { data } = useCurrentRoute();

        return (
          <Modal
            header={data.settings.header}
            content={data.settings.content}
            onClose={() => {}}
          />
        );
      },
    }),
  })
);

export default routes;
