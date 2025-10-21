import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import components from "pages/FlowEditor/components/forms";
import FormModal from "pages/FlowEditor/components/forms/FormModal";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { z } from "zod";

import { getExternalPortals, sortFlows } from "../_utils";
// ... same imports as above

const newNodeSearchSchema = z.object({
  type: z.string().optional().default("question"),
});

export const Route = createFileRoute(
  "/_authenticated/$team/$flow/nodes/$parent/nodes/new/$before",
)({
  validateSearch: zodValidator(newNodeSearchSchema),

  loaderDeps: ({ search }) => ({ type: search.type }),

  loader: async ({ params, deps }) => {
    const { type } = deps;
    const { team, flow, parent, before } = params;

    const extraProps: any = {};

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
      before, // This route has the before param
    };
  },

  component: NewNodeWithBeforeModal,
});

function NewNodeWithBeforeModal() {
  const { type, extraProps, parent, before } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();

  const handleTypeChange = (newType: string) => {
    navigate({
      to: router.latestLocation.pathname,
      search: { type: newType },
    });
  };

  return (
    <FormModal
      type={type}
      Component={components[type]}
      extraProps={extraProps}
      parent={parent}
      before={before}
      onTypeChange={handleTypeChange}
    />
  );
}
