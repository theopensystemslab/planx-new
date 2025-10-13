import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const SketchPlanFullDescriptionCA: Schema = {
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
        title: "Tree description",
        description: "For example 'rear garden, mature (80cm diameter)'.",
        fn: "description",
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
  ],
  min: 1,
} as const;
