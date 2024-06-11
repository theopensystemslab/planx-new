import { Schema } from "@planx/components/List/model";

export const CommunalSpaceGLA: Schema = {
  type: "Unit of communal space",
  fields: [
    {
      type: "question",
      data: {
        title: "Is this unit of communal space lost or gained?",
        fn: "development",
        options: [
          { id: "gain", data: { text: "Gained", val: "gain" } },
          { id: "loss", data: { text: "Lost", val: "loss" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "What is the Gross Internal Floor Area (GIA) of this unit?",
        units: "m²",
        fn: "area",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many identical units does the description above apply to?",
        fn: "identicalUnits",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
