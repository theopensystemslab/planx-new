import { createFileRoute } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import components from "pages/FlowEditor/components/forms";
import AddComponentModal from "pages/FlowEditor/components/forms/AddComponentModal";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import React from "react";

import { loader } from "./-loader";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/nodes/new/",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type = "question" } = deps;
    const { team, flow } = params;

    return loader({
      team,
      flow,
      type,
      includeHandleDelete: false,
    });
  },

  component: NewNodeModal,
});

function NewNodeModal() {
  const search = Route.useSearch();
  const { type, extraProps, parent, before } = Route.useLoaderData();

  if (!search.type && hasFeatureFlag("COMPONENT_SELECT")) {
    return <AddComponentModal parent={parent} before={before} />;
  }

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
