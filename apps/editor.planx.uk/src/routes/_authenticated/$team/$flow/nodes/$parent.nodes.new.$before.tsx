import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";

import { sharedNodeLoader } from "./sharedNodeLoader";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$parent/nodes/new/$before",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type = "question" } = deps;
    const { team, flow, parent, before } = params;

    return sharedNodeLoader({
      team,
      flow,
      type,
      parent,
      before,
      includeExtraProps: true,
      includeHandleDelete: false,
    });
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
