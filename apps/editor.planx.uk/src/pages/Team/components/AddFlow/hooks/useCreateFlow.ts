import { useMutation } from "@tanstack/react-query";
import {
  createFlow,
  createFlowFromCopy,
  createFlowFromTemplate,
} from "api/flow/requests";
import { useStore } from "pages/FlowEditor/lib/store";

import { CreateFlow } from "../types";

export const useCreateFlow = () => {
  return useMutation({
    mutationFn: async ({ mode, flow }: CreateFlow) => {
      const mutation = {
        new: createFlow,
        copy: createFlowFromCopy,
        template: createFlowFromTemplate,
      }[mode];

      await mutation(flow);
      return { mode, flow };
    },
    onSuccess: ({ mode }) => {
      if (mode === "template") useStore.setState({ isTemplatedFrom: true });
    },
  });
};
