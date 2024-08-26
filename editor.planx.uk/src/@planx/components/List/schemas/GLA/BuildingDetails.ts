import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const BuildingDetailsGLA: Schema = {
  type: "Building detail",
  fields: [
    {
      type: "text",
      data: {
        title: "Building reference",
        fn: "reference",
        type: TextInputType.Short,
      },
    },
    {
      type: "number",
      data: {
        title: "What is the maximum height of the building?",
        units: "m",
        fn: "height",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many storeys does the building have?",
        fn: "storeys",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
