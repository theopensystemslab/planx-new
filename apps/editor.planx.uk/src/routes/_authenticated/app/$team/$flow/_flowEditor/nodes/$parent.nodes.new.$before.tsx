import { createFileRoute } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import components from "pages/FlowEditor/components/forms";
import AddComponentModal from "pages/FlowEditor/components/forms/AddComponentModal";
import FormModal from "pages/FlowEditor/components/forms/FormModal";

import { loader } from "./-loader";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/nodes/$parent/nodes/new/$before",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type = "question" } = deps;
    const { team, flow, parent, before } = params;

    return loader({
      team,
      flow,
      type,
      parent,
      before,
      includeHandleDelete: false,
    });
  },

  component: NewNodeWithBeforeModal,
});

function NewNodeWithBeforeModal() {
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
