import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";

import { loader } from "./-loader";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/nodes/$parent/nodes/new/",
)({
  loaderDeps: ({ search }) => ({
    type: search.type,
    placement: search.placement,
  }),
  loader: async ({ params, deps }) => {
    const { type = "question", placement } = deps;
    const { team, flow, parent } = params;

    return loader({
      team,
      flow,
      type,
      placement,
      parent,
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
