import { gql } from "@apollo/client";
import natsort from "natsort";
import { compose, lazy, mount, route, withData, withView } from "navi";
import React from "react";
import { View } from "react-navi";

import { client } from "../lib/graphql";
import FlowEditor from "../pages/FlowEditor";
import Checklist from "../pages/FlowEditor/components/forms/Checklist";
import Content from "../pages/FlowEditor/components/forms/Content";
import FindProperty from "../pages/FlowEditor/components/forms/FindProperty";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import Notice from "../pages/FlowEditor/components/forms/Notice";
import Portal from "../pages/FlowEditor/components/forms/Portal";
import PropertyInformation from "../pages/FlowEditor/components/forms/PropertyInformation";
import Question from "../pages/FlowEditor/components/forms/Question";
import Result from "../pages/FlowEditor/components/forms/Result";
import TaskList from "../pages/FlowEditor/components/forms/TaskList";
import { TYPES } from "../pages/FlowEditor/data/types";
import { api } from "../pages/FlowEditor/lib/store";
import { makeTitle } from "./utils";

const components = {
  "find-property": FindProperty,
  "property-information": PropertyInformation,
  "task-list": TaskList,
  notice: Notice,
  result: Result,
  checklist: Checklist,
  portal: Portal,
  question: Question,
  content: Content,
};

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

  const { $t } = api.getState().getNode(id);

  const extraProps = {} as any;

  let type;
  switch ($t) {
    case TYPES.Checklist:
      type = "checklist";
      break;
    case TYPES.FindProperty:
      type = "find-property";
      break;
    case TYPES.TaskList:
      type = "task-list";
      break;
    case TYPES.Notice:
      type = "notice";
      break;
    case TYPES.Content:
      type = "content";
      break;
    case TYPES.Result:
      type = "result";
      break;
    case TYPES.Portal:
      type = "portal";

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

      break;
    case TYPES.PropertyInformation:
      type = "property-information";
      break;
    default:
      type = "question";
  }

  if (type === "checklist" || type === "question") {
    extraProps.options = api.getState().childNodesOf(id);
  }

  return {
    title: makeTitle(`Edit ${type}`),
    view: (
      <FormModal
        type={type}
        Component={components[type]}
        extraProps={extraProps}
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
