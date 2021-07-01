import Airtable from "airtable";
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
import { GlobalContent, PreviewContext } from "../pages/Preview/Context";
import Layout from "../pages/Preview/PreviewLayout";
import Questions from "../pages/Preview/Questions";
import { AirtableStatus, Flow, FOOTER_ITEMS, TextContent } from "../types";

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
        }
      `,
      variables: {
        flowSlug: req.params.flow.split(",")[0],
        teamSlug: req.params.team,
      },
    });

    const flow: Flow = data.flows[0];

    const records = (async () => {
      try {
        const base = new Airtable({ apiKey: "keyI7kFOwsgUCPG3w" }).base(
          "appGAyYlJVo3f6MbA"
        );

        const records = await base("Footer pages")
          .select({
            view: "Grid view",
          })
          .firstPage();

        return records;
      } catch (e) {
        console.error(e);
      }
    })();

    const globalContent = (await records)?.reduce(
      (acc: { [key: string]: any }, record: any) => {
        const name = record.get("Name") as string;
        const status = record.get("Status") as AirtableStatus;
        const heading = record.get("Heading") as string;
        const content = record.get("Content") as string;
        const slug = record.get("slug") as string;

        if (slug && status === "Live") {
          acc[slug] = {
            name,
            status,
            heading,
            content,
          };
        }

        return acc;
      },
      {}
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

    // const settings = {
    //   elements: { ...flow.settings?.elements, ...globalFooterContent },
    // };

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

          const validateGlobalSetting = (setting?: string) => {
            const globalSetting = context?.globalContent?.[req.params.page];
            if (!(globalSetting && globalSetting?.status === "Live")) return;

            return {
              heading: globalSetting.heading,
              content: globalSetting.content,
            };
          };

          const content = FOOTER_ITEMS.includes(req.params.page)
            ? validateFlowSetting()
            : validateGlobalSetting();

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
