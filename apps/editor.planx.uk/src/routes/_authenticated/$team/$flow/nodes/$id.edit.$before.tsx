import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";

import { loader } from "./loader";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$id/edit/$before",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { team, flow, id, before } = params;
    const { type } = deps;

    return loader({
      team,
      flow,
      id,
      type,
      parent: undefined,
      before,
      includeExtraProps: true,
      includeHandleDelete: false,
    });
  },
  component: EditNodeWithBeforeModal,
});

function EditNodeWithBeforeModal() {
  const {
    type: actualType,
    extraProps,
    node,
    id,
    parent,
    before,
  } = Route.useLoaderData();

  return (
    <FormModal
      type={actualType}
      Component={components[actualType]}
      extraProps={extraProps}
      node={node}
      id={id}
      parent={parent}
      before={before}
    />
  );
}
