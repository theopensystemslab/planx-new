import { FlowGraph } from "@opensystemslab/planx-core/types";
import axios from "axios";
import gql from "graphql-tag";
import {
  compose,
  lazy,
  mount,
  NotFoundError,
  route,
  withData,
  withView,
} from "navi";
import React from "react";

import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import Team from "../pages/Team";
import { makeTitle } from "./utils";
import { teamView } from "./views/team";

let cached: { flowSlug?: string; teamSlug?: string } = {
  flowSlug: undefined,
  teamSlug: undefined,
};

const routes = compose(
  withData((req) => ({
    team: req.params.team,
  })),

  withView(async (req) => await teamView(req)),

  mount({
    "/": route(() => ({
      title: makeTitle(useStore.getState().teamName),
      view: <Team />,
    })),

    "/settings": lazy(() => import("./teamSettings")),

    "/:flow": lazy(async (req) => {
      const [slug] = req.params.flow.split(",");

      const variables = {
        flowSlug: slug,
        teamSlug: req.params.team,
      };

      if (JSON.stringify(cached) !== JSON.stringify(variables)) {
        cached = variables;

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
                name
              }
            }
          `,
          variables,
        });

        const flow = data.flows[0];

        if (!flow) {
          return route({
            title: "Flow Not Found",
            view: <p>Flow Not Found</p>,
          });
        }

        useStore.getState().setFlowSlug(slug);
        await useStore.getState().connectTo(flow.id);
      }

      return import("./flow");
    }),

    "/members": lazy(() => import("./teamMembers")),
  })
);

const fetchDraftFlattenedFlowData = async (
  flowId: string
): Promise<FlowGraph> => {
  const url = `${process.env.REACT_APP_API_URL}/flows/${flowId}/flatten-data?draft=true`;
  try {
    const { data } = await axios.get<FlowGraph>(url);
    return data;
  } catch (error) {
    console.log(error);
    throw new NotFoundError();
  }
};

export default routes;
