import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const TreeDescriptionCA: Schema = {
  type: "Tree",
  fields: [
    {
      type: "text",
      data: {
        title: "Tree reference number",
        description: "This is the tree's number as shown on your sketch plan.",
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
        title: "Proposed work",
        fn: "work",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
