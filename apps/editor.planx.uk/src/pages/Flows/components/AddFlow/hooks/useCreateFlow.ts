import { useMutation } from "@tanstack/react-query";
import type { APIError } from "lib/api/client";
import {
  createFlow,
  createFlowFromCopy,
  createFlowFromTemplate,
} from "lib/api/flow/requests";
import type { NewFlow } from "lib/api/flow/types";
import { useStore } from "pages/FlowEditor/lib/store";

import type { CreateFlow } from "../types";

export const isUniquenessViolationError = (
  error: APIError<{ error?: string }>,
): boolean => Boolean(error.data?.error?.includes("Uniqueness violation"));

export const useCreateFlow = () => {
  return useMutation<
    { mode: CreateFlow["mode"]; flow: NewFlow },
    APIError<{ error?: string }>,
    CreateFlow
  >({
    mutationFn: async ({ mode, flow }: CreateFlow) => {
      const mutation = {
        new: createFlow,
        copy: createFlowFromCopy,
        template: createFlowFromTemplate,
      }[mode];

      await mutation(flow);
      return { mode, flow: flow };
    },
    onSuccess: ({ mode }) => {
      if (mode === "template") useStore.setState({ isTemplatedFrom: true });
    },
  });
};
