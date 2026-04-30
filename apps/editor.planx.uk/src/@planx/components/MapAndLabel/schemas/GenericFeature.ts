import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const GenericFeature: Schema = {
  type: "Feature",
  fields: [
    {
      type: "text",
      data: {
        title: "Description",
        fn: "description",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
