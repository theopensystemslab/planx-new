import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const SketchPlanTPO: Schema = {
  type: "Tree",
  fields: [
    {
      type: "text",
      data: {
        title: "Species",
        fn: "species",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Proposed work",
        fn: "work",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Reasons for the proposed work",
        fn: "reason",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
