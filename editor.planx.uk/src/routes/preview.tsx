import gql from "graphql-tag";
import { NotFoundError, route } from "navi";
import React from "react";

import { dataMerged } from "../lib/dataMergedHotfix";
import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import Preview from "../pages/Preview";
import { PreviewContext } from "../pages/Preview/Context";

const routes = route(async (req) => {
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
  // TODO: Replace with below after merging
  // https://github.com/theopensystemslab/planx-new/pull/116
  //
  // useStore.getState().setFlow(flow.id, flow.data_merged);

  // TODO: `theme` should fall under `settings.design`
  return {
    view: (
      <PreviewContext.Provider value={flow}>
        <Preview theme={flow.team.theme} settings={flow.team.settings} />
      </PreviewContext.Provider>
    ),
  };
});

export default routes;
