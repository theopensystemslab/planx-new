import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const BreachLocations: Schema = {
  type: "Breach",
  fields: [
    {
      type: "text",
      data: {
        title: "Breach description",
        fn: "referenceDescription",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
