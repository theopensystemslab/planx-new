import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";
import { calculateExtraProps } from "utils/routeUtils/queryUtils";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$parent/nodes/new/$before",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),

  loader: async ({ params, deps }) => {
    const { type = "question" } = deps;
    const { team, flow, parent, before } = params;

    const extraProps = await calculateExtraProps(type, team, flow);

    return {
      type,
      extraProps,
      parent,
      before,
    };
  },

  component: NewNodeWithBeforeModal,
});

function NewNodeWithBeforeModal() {
  const { type, extraProps, parent, before } = Route.useLoaderData();

  return (
    <FormModal
      type={type}
      Component={components[type]}
      extraProps={extraProps}
      parent={parent}
      before={before}
    />
  );
}
