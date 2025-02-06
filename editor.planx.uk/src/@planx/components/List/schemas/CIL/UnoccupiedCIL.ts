import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const UnoccupiedBuildingsCIL: Schema = {
  type: "Building",
  fields: [
    {
      type: "text",
      data: {
        title: "Describe the existing building",
        fn: "descriptionExisting",
        type: TextInputType.Short,
      },
    },
    {
      type: "number",
      data: {
        title: "How much floorspace will be retained?",
        units: "m²",
        fn: "area.retained",
        allowNegatives: false,
      },
    },
    {
      type: "text",
      data: {
        title: "What will the retained floorspace be used for?",
        description: "This can be identical to its current use.",
        fn: "descriptionProposed",
        type: TextInputType.Short,
      },
    },
    {
      type: "number",
      data: {
        title: "How much floorspace will be lost?",
        units: "m²",
        fn: "area.loss",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
