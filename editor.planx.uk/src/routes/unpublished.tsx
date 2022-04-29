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
import { ApplicationPath, Flow, GlobalSettings, Maybe } from "types";

import { isSaveReturnFlow } from "./utils";

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
              name
            }
            settings
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

    const flowData = await dataMerged(flow.id);
    useStore.getState().setFlow(flow.id, flowData);

    const path = isSaveReturnFlow(flowData)
      ? ApplicationPath.SaveAndReturn
      : ApplicationPath.SingleSession;
    useStore.getState().setPath(path);

    return (
      <PreviewContext.Provider value={{ flow, globalSettings }}>
        <Layout
          team={flow.team}
          settings={flow.settings}
          footerContent={globalSettings?.footerContent}
          headerVariant={HeaderVariant.Unpublished}
        >
          <View />
        </Layout>
      </PreviewContext.Provider>
    );
  }),

  mount({
    "/": route({
      view: <Questions previewEnvironment="editor" />,
    }),
    "/pages/:page": map((req) => {
      return route({
        view: () => <ContentPage page={req.params.page} />,
      });
    }),
  })
);

export default routes;
