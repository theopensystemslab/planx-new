import { gql } from "@apollo/client";
import natsort from "natsort";
import { compose, lazy, mount, route, withData, withView } from "navi";
import mapAccum from "ramda/src/mapAccum";
import React from "react";
import { View } from "react-navi";

import { client } from "../lib/graphql";
import FlowEditor from "../pages/FlowEditor";
import components from "../pages/FlowEditor/components/forms";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import { TYPES, SLUGS } from "../pages/FlowEditor/data/types";
import { api } from "../pages/FlowEditor/lib/store";
import { makeTitle } from "./utils";

const newNode = route(async (req) => {
  const { type = "question", before = null, parent = null } = req.params;

  const extraProps = {} as any;

  if (type === "portal") {
    const { data } = await client.query({
      query: gql`
        query GetFlows {
          flows(order_by: { name: asc }) {
            id
            name
            slug
            team {
              slug
            }
          }
        }
      `,
    });

    const sorter = natsort({ insensitive: true });

    extraProps.externalFlows = data.flows
      .filter(
        (flow) =>
          flow.team &&
          !window.location.pathname.includes(`${flow.team.slug}/${flow.slug}`)
      )
      .sort(sorter);

    extraProps.internalFlows = Object.entries(api.getState().flow.nodes)
      .filter(
        ([id, v]: any) =>
          v.$t === TYPES.Portal &&
          !window.location.pathname.includes(id) &&
          v.text
      )
      .map(([id, { text }]: any) => ({ id, text }))
      .sort((a, b) =>
        sorter(a.text.replace(/\W|\s/g, ""), b.text.replace(/\W|\s/g, ""))
      );
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

const editNode = route(async (req) => {
  const { id, before = null, parent = null } = req.params;

  const node = api.getState().getNode(id);

  const extraProps = {} as any;

  if (node.$t === TYPES.Portal) {
    const { data } = await client.query({
      query: gql`
        query GetFlows {
          flows(order_by: { name: asc }) {
            id
            name
            slug
            team {
              slug
            }
          }
        }
      `,
    });

    const sorter = natsort({ insensitive: true });

    extraProps.externalFlows = data.flows
      .filter(
        (flow) =>
          flow.team &&
          !window.location.pathname.includes(`${flow.team.slug}/${flow.slug}`)
      )
      .sort(sorter);
  }

  const type = SLUGS[node.$t];

  if (type === "checklist" || type === "question") {
    const childNodes = api.getState().childNodesOf(id);
    if (node.categories) {
      extraProps.groupedOptions = mapAccum(
        (index: number, category: { title: string; count: number }) => [
          index + category.count,
          {
            title: category.title,
            children: childNodes.slice(index, index + category.count),
          },
        ],
        0,
        node.categories
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
          api.getState().removeNode(id, parent);
        }}
        before={before}
        parent={parent}
      />
    ),
  };
});

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

  withView((req) => {
    const [flow, ...breadcrumbs] = req.params.flow.split(",");
    return (
      <>
        <FlowEditor key={flow} flow={flow} breadcrumbs={breadcrumbs} />
        <View />
      </>
    );
  }),

  mount({
    "/": route(async (req) => {
      return {
        title: makeTitle([req.params.team, req.params.flow].join("/")),
        view: <span />,
      };
    }),

    "/nodes": nodeRoutes,

    "/settings": lazy(() => import("./flowSettings")),
  })
);

export default routes;
