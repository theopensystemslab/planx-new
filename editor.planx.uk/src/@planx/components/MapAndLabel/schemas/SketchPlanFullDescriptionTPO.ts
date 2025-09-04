import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const SketchPlanFullDescriptionTPO: Schema = {
  type: "Tree",
  fields: [
    {
      type: "text",
      required: false,
      data: {
        title: "Tree reference number",
        description:
          "This is the tree's number as shown in the First Schedule of the Tree Preservation Order.",
        fn: "referenceNumber",
        type: TextInputType.Short,
      },
    },
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
