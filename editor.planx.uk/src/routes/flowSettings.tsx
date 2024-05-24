import { FlowStatus } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import {
  compose,
  map,
  mount,
  NaviRequest,
  NotFoundError,
  redirect,
  route,
  withData,
} from "navi";
import DataManagerSettings from "pages/FlowEditor/components/Settings/DataManagerSettings";
import ServiceFlags from "pages/FlowEditor/components/Settings/ServiceFlags";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings";
import Submissions from "pages/FlowEditor/components/Settings/Submissions";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import Settings, { SettingsTab } from "../pages/FlowEditor/components/Settings";
import type { FlowSettings } from "../types";
import { makeTitle } from "./utils";

interface GetFlowSettings {
  flows: {
    id: string;
    settings: FlowSettings;
    status: FlowStatus;
  }[];
}

export const getFlowSettings = async (req: NaviRequest) => {
  const {
    data: {
      flows: [{ settings, status }],
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
};

const tabs: SettingsTab[] = [
  {
    name: "Service",
    route: "service",
    Component: ServiceSettings,
  },
  {
    name: "Service Flags",
    route: "flags",
    Component: ServiceFlags,
  },
  {
    name: "Data",
    route: "data-manager",
    Component: DataManagerSettings,
  },
  {
    name: "Submissions",
    route: "submissions",
    Component: Submissions,
  },
];

const flowSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": redirect("./service"),
    "/:tab": map(async (req) => {
      const isAuthorised = useStore.getState().canUserEditTeam(req.params.team);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return route({
        getData: getFlowSettings,
        title: makeTitle(
          [req.params.team, req.params.flow, "Flow Settings"].join("/"),
        ),
        view: <Settings currentTab={req.params.tab} tabs={tabs} />,
      });
    }),
  }),
);

export default flowSettingsRoutes;
