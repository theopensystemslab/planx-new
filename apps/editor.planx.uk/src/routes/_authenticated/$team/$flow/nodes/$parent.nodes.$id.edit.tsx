import { createFileRoute, notFound } from "@tanstack/react-router";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { calculateExtraProps } from "utils/routeUtils/queryUtils";

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$parent/nodes/$id/edit",
)({
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { team, flow, parent, id } = params;
    const { type } = deps;

    const node = useStore.getState().getNode(id);
    if (!node) {
      throw notFound();
    }

    const nodeType = node.type ? SLUGS[node.type] : undefined;
    const actualType = (type || nodeType || "question") as NonNullable<
      typeof type
    >;

    const extraProps = await calculateExtraProps(actualType, team, flow, {
      nodeId: id,
      node,
      isEdit: true,
    });

    return {
      type: actualType,
      extraProps,
      node,
      id,
      parent,
      before: undefined,
    };
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
  } = Route.useLoaderData();

  const handleDelete = () => {
    useStore.getState().removeNode(id, parent!);
  };

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
