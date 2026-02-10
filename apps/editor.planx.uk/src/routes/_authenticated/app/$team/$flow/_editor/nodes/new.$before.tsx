import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";

import { loader } from "./-loader";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_editor/nodes/new/$before",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type = "question" } = deps;
    const { team, flow, before } = params;

    return loader({
      team,
      flow,
      type,
      parent: undefined,
      before,
      includeExtraProps: true,
      includeHandleDelete: false,
    });
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
