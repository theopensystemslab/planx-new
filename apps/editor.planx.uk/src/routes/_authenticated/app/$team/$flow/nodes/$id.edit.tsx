import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";

import { loader } from "./-loader";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/nodes/$id/edit",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { team, flow, id } = params;
    const { type } = deps;

    return loader({
      team,
      flow,
      id,
      type,
      parent: undefined,
      before: undefined,
      includeExtraProps: true,
      includeHandleDelete: true,
    });
  },
  component: EditNodeModal,
});

function EditNodeModal() {
  const {
    type: actualType,
    extraProps,
    node,
    id,
    parent,
    before,
    handleDelete,
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
      handleDelete={handleDelete}
    />
  );
}
