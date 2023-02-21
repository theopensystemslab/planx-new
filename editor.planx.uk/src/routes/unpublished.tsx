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

import { setPath } from "./utils";
import { getTeamFromDomain } from "./utils";

const routes = compose(
  withData(async (req) => ({
    mountpath: req.mountpath,
    team:
      req.params.team || (await getTeamFromDomain(window.location.hostname)),
  })),

  withView(async (req) => {
    const flowSlug = req.params.flow.split(",")[0];

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
        flowSlug,
        teamSlug:
          req.params.team ||
          (await getTeamFromDomain(window.location.hostname)),
      },
    });

    const flow: Flow = data.flows[0];

    const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
      data.global_settings[0]
    );

    if (!flow) throw new NotFoundError();

    const flowData = await dataMerged(flow.id);
    useStore.getState().setFlow({ id: flow.id, flow: flowData, flowSlug });

    setPath(flowData, req);

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
        data: { isContentPage: true },
      });
    }),
  })
);

export default routes;
