import { gql } from "@apollo/client";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import natsort from "natsort";
import {
  compose,
  lazy,
  map,
  Matcher,
  mount,
  redirect,
  route,
  withData,
  withView,
} from "navi";
import mapAccum from "ramda/src/mapAccum";
import React from "react";

import { client } from "../lib/graphql";
import FlowEditor from "../pages/FlowEditor";
import components from "../pages/FlowEditor/components/forms";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import { SLUGS } from "../pages/FlowEditor/data/types";
import { useStore } from "../pages/FlowEditor/lib/store";
import type { Flow } from "../types";
import { makeTitle } from "./utils";
import { flowEditorView } from "./views/flowEditor";
import { View } from "react-navi";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings";
import Submissions from "pages/FlowEditor/components/Settings/Submissions";
import DataManagerSettings from "pages/FlowEditor/components/Settings/DataManagerSettings";
import ServiceFlags from "pages/FlowEditor/components/Settings/ServiceFlags";

const sorter = natsort({ insensitive: true });
const sortFlows = (a: { text: string }, b: { text: string }) =>
  sorter(a.text.replace(/\W|\s/g, ""), b.text.replace(/\W|\s/g, ""));

const getExternalPortals = async () => {
  const { data } = await client.query({
    query: gql`
      query GetFlows {
        flows(order_by: { slug: asc }) {
          id
          slug
          team {
            slug
          }
        }
      }
    `,
  });

  return data.flows
    .filter(
      (flow: Flow) =>
        flow.team &&
        !window.location.pathname.includes(`${flow.team.slug}/${flow.slug}`),
    )
    .map(({ id, team, slug }: Flow) => ({
      id,
      text: [team.slug, slug].join("/"),
    }))
    .sort(sortFlows);
};

const newNode = route(async (req) => {
  const {
    type = "question",
    before = undefined,
    parent = undefined,
  } = req.params;

  const extraProps = {} as any;

  if (type === "external-portal") {
    extraProps.flows = await getExternalPortals();
  } else if (type === "internal-portal") {
    extraProps.flows = Object.entries(useStore.getState().flow)
      .filter(
        ([id, v]: any) =>
          v.type === TYPES.InternalPortal &&
          !window.location.pathname.includes(id) &&
          v.data?.text,
      )
      .map(([id, { data }]: any) => ({ id, text: data.text }))
      .sort(sortFlows);
  }

  return {
    title: makeTitle(`New ${type}`),
    view: (
      <FormModal
        type={type}
        Component={components[type]}
        extraProps={extraProps}
        before={before}
        parent={parent}
      />
    ),
  };
});

// If nodeId is invalid (e.g. a deleted node), fall back to flow
const validateNodeRoute = (route: Matcher<object, object>) =>
  map((req) => {
    const { team, flow, id } = req.params;
    const node = useStore.getState().getNode(id);
    if (!node) return redirect(`/${team}/${flow}`);
    return route;
  });

const editNode = validateNodeRoute(
  route(async (req) => {
    const { id, before = undefined, parent = undefined } = req.params;

    const node = useStore.getState().getNode(id) as {
      type: TYPES;
      [key: string]: any;
    };

    const extraProps = {} as any;

    if (node.type === TYPES.ExternalPortal)
      extraProps.flows = await getExternalPortals();

    const type = SLUGS[node.type];

    if (type === "checklist" || type === "question") {
      const childNodes = useStore.getState().childNodesOf(id);
      if (node.data?.categories) {
        extraProps.groupedOptions = mapAccum(
          (index: number, category: { title: string; count: number }) => [
            index + category.count,
            {
              title: category.title,
              children: childNodes.slice(index, index + category.count),
            },
          ],
          0,
          node.data.categories,
        )[1];
      } else {
        extraProps.options = childNodes;
      }
    }

    return {
      title: makeTitle(`Edit ${type}`),
      view: (
        <FormModal
          type={type}
          Component={components[type]}
          extraProps={extraProps}
          node={node}
          id={id}
          handleDelete={() => {
            useStore.getState().removeNode(id, parent!);
          }}
          before={before}
          parent={parent}
        />
      ),
    };
  }),
);

const nodeRoutes = mount({
  "/new/:before": newNode,
  "/new": newNode,
  "/:parent/nodes/new/:before": newNode,
  "/:parent/nodes/new": newNode,

  "/:id/edit": editNode,
  "/:id/edit/:before": editNode,
  "/:parent/nodes/:id/edit/:before": editNode,
  "/:parent/nodes/:id/edit": editNode,
});

const routes = compose(
  withData((req) => ({
    flow: req.params.flow.split(",")[0],
  })),

  withView(flowEditorView),

  mount({
    "/": route(async (req) => {
      return {
        title: makeTitle([req.params.team, req.params.flow].join("/")),
        view: () => {
          const [flow, ...breadcrumbs] = req.params.flow.split(",");
          return (
            <FlowEditor key={flow} flow={flow} breadcrumbs={breadcrumbs} />
          )
        }
      }
    }),

    "/nodes": compose(
      withView((req) => {
        const [flow, ...breadcrumbs] = req.params.flow.split(","); 
        return (
          <>
            <FlowEditor key={flow} flow={flow} breadcrumbs={breadcrumbs} />
            <View/>
          </>
        );
      }),
      nodeRoutes,
    ),

    "/settings": lazy(() => import("./flowSettings")),

    "/service": route(async (req) => ({
      title: makeTitle([req.params.team, req.params.flow, "service"].join("/")),
      view: ServiceSettings,
    })),

    "/service-flags": route(async (req) => ({
      title: makeTitle([req.params.team, req.params.flow, "service-flags"].join("/")),
      view: ServiceFlags,
    })),

    "/data": route(async (req) => ({
      title: makeTitle([req.params.team, req.params.flow, "data"].join("/")),
      view: DataManagerSettings,
    })),

    "/submissions-log": route(async (req) => ({
      title: makeTitle([req.params.team, req.params.flow, "submissions-log"].join("/")),
      view: Submissions,
    })),
  }),
);

export default routes;
