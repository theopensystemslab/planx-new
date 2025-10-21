import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import natsort from "natsort";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { z } from "zod";

import { getExternalPortals, sortFlows } from "../_utils";

const newNodeSearchSchema = z.object({
  type: z.string().optional().default("question"),
});

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$parent/nodes/new",
)({
  validateSearch: zodValidator(newNodeSearchSchema),
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ params, deps }) => {
    const { type } = deps;
    const { team, flow, parent } = params;

    const extraProps: any = {};

    // Pass in list of relevant flows for portals
    if (type === "nested-flow") {
      extraProps.flows = await getExternalPortals(team, flow);
    } else if (type === "folder") {
      extraProps.flows = Object.entries(useStore.getState().flow)
        .filter(
          ([id, v]: any) =>
            v.type === TYPES.InternalPortal &&
            !window.location.pathname.includes(id) &&
            v.data?.text,
        )
        .map(([id, { data }]: any) => ({ id, text: data.text }))
        .sort(sortFlows);
    }

    return {
      type,
      extraProps,
      parent,
      before: undefined, // No before param in this route
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
