import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const MezzanineCIL: Schema = {
  type: "Mezzanine floor",
  fields: [
    {
      type: "text",
      data: {
        title: "Describe the use of the mezzanine",
        fn: "description",
        type: TextInputType.Short,
      },
    },
    {
      type: "number",
      data: {
        title: "What will be the floorspace of the mezzanine?",
        units: "m²",
        fn: "area",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
