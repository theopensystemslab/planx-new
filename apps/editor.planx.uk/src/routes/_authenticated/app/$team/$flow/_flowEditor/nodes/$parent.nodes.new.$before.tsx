import { createFileRoute } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";

import { loader } from "./-loader";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/nodes/$parent/nodes/new/$before",
)({
  loaderDeps: ({ search }) => ({
    type: search.type,
    placement: search.placement,
    dbNoteId: search.dbNoteId,
  }),
  loader: async ({ params, deps }) => {
    const { type = "question", placement, dbNoteId } = deps;
    const { team, flow, parent, before } = params;

    return loader({
      team,
      flow,
      type,
      placement,
      dbNoteId,
      parent,
      before,
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
