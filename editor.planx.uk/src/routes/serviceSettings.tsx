import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { compose, mount, NaviRequest, route, withData } from "navi";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings";

import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import type { FlowSettings } from "../types";
import { makeTitle } from "./utils";

interface GetFlowSettings {
  flows: {
    id: string;
    settings: FlowSettings;
    status: FlowStatus;
    description: string;
  }[];
}

export const getFlowSettings = async (req: NaviRequest) => {
  const {
    data: {
      flows: [{ settings, status, description }],
    },
  } = await client.query<GetFlowSettings>({
    query: gql`
      query GetFlow($slug: String!, $team_slug: String!) {
        flows(
          limit: 1
          where: { slug: { _eq: $slug }, team: { slug: { _eq: $team_slug } } }
        ) {
          id
          settings
          description
          status
        }
      }
    `,
    variables: {
      slug: req.params.flow,
      team_slug: req.params.team,
    },
  });

  useStore.getState().setFlowSettings(settings);
  useStore.getState().setFlowStatus(status);
  useStore.getState().setFlowDescription(description);
};

const serviceSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  mount({
    "/": compose(
      route(async (req) => ({
        getData: await getFlowSettings(req),
        title: makeTitle(
          [req.params.team, req.params.flow, "service"].join("/"),
        ),
        view: ServiceSettings,
      })),
    ),
  }),
);

export default serviceSettingsRoutes;
