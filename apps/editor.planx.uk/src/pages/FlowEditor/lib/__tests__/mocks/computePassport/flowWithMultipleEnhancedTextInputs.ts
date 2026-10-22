import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Store } from "pages/FlowEditor/lib/store";

export const flowWithMultipleEnhancedTextInputs: Store.Flow = {
  _root: {
    edges: ["projectDescriptionNode", "workDescriptionNode"],
  },
  projectDescriptionNode: {
    type: TYPES.EnhancedTextInput,
    data: {
      title: "Describe your project",
      task: "projectDescription",
      fn: "proposal.description",
    },
  },
  workDescriptionNode: {
    type: TYPES.EnhancedTextInput,
    data: {
      title: "Describe the works",
      task: "projectDescription",
      fn: "proposal.works.description",
    },
  },
};
