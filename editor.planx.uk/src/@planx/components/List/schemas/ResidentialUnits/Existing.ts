import { Schema } from "../../model";

export const ResidentialUnitsExisting: Schema = {
  type: "Existing residential unit",
  fields: [
    {
      type: "question",
      unique: true,
      data: {
        title: "What best describes the tenure of this unit?",
        fn: "tenure",
        options: [
          { id: "MH", data: { text: "Market housing" } },
          { id: "SAIR", data: { text: "Social, affordable or interim rent" } },
          { id: "AHO", data: { text: "Affordable home ownership" } },
          { id: "SH", data: { text: "Starter homes" } },
          {
            id: "selfCustomBuild",
            data: { text: "Self-build and custom build" },
          },
          { id: "other", data: { text: "Other" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "What best describes the type of this unit?",
        fn: "type",
        options: [
          { id: "house", data: { text: "House" } },
          { id: "flat", data: { text: "Flat, apartment or maisonette" } },
          { id: "sheltered", data: { text: "Sheltered housing" } },
          { id: "studio", data: { text: "Studio or bedsit" } },
          { id: "cluster", data: { text: "Cluster flat" } },
          { id: "other", data: { text: "Other" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "How many bedrooms does this existing unit have?",
        fn: "bedrooms",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many identical units will the description above apply to?",
        fn: "identicalUnits",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
