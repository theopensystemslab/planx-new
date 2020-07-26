import { compose, mount, route, withData, withView } from "navi";
import React from "react";
import { View } from "react-navi";
import FlowEditor from "../pages/FlowEditor";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import Question from "../pages/FlowEditor/components/forms/Question";
import { api } from "../pages/FlowEditor/lib/store";
import { makeTitle } from "./utils";

const newNode = route(async (req) => {
  const { type = "question" } = req.params;
  return {
    title: makeTitle(`New ${type}`),
    view: <FormModal type={type} Component={Question} />,
  };
});

const editNode = route(async (req) => {
  const { id, type = "question" } = req.params;
  return {
    title: makeTitle(`Edit ${type}`),
    view: (
      <FormModal
        type={type}
        Component={Question}
        handleDelete={() => {
          api.getState().removeNode(id);
        }}
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
});

const routes = compose(
  withData((req) => ({
    flow: req.params.flow,
  })),

  withView((req) => {
    const [flow, ...breadcrumbs] = req.params.flow.split(",");

    return (
      <>
        <FlowEditor flow={flow} breadcrumbs={breadcrumbs} />
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
  })
);

export default routes;
