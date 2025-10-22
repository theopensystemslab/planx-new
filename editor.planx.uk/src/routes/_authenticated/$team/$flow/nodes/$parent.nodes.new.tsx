import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";

import { calculateExtraProps } from "../_utils";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$parent/nodes/new",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type } = deps;
    const { team, flow, parent } = params;

    const extraProps = await calculateExtraProps(type, team, flow);

    return {
      type,
      extraProps,
      parent,
      before: undefined,
    };
  },

  component: NewNodeModal,
});

function NewNodeModal() {
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
