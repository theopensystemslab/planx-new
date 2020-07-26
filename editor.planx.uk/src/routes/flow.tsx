import { compose, mount, route, withData, withView } from "navi";
import React from "react";
import { View } from "react-navi";
import FlowEditor from "../pages/FlowEditor";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import Question from "../pages/FlowEditor/components/forms/Question";
import { makeTitle } from "./utils";

const newNode = route(async (req) => {
  const { type = "question" } = req.params;
  return {
    title: makeTitle(`New ${type}`),
    view: <FormModal type={type} Component={Question} />,
  };
});

const nodeRoutes = mount({
  "/new/:before": newNode,
  "/new": newNode,
  "/:parent/nodes/new/:before": newNode,
  "/:parent/nodes/new": newNode,
});

const routes = compose(
  withData((req) => ({
    flow: req.params.flow,
  })),

  withView(() => (
    <>
      <FlowEditor />
      <View />
    </>
  )),

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
