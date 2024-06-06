import { Schema } from "@planx/components/List/model";

export const ResidentialUnitsGLANew: Schema = {
  type: "New residential unit",
  fields: [
    {
      type: "number",
      data: {
        title:
          "How many residential units does the description above apply to?",
        fn: "numberIdenticalUnits",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
