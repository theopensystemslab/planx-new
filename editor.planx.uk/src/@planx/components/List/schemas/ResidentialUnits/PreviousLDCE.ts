import { Schema } from "@planx/components/shared/Schema/model";

export const ResidentialUnitsPreviousLDCE: Schema = {
  type: "Previously existing residential unit type",
  fields: [
    {
      type: "number",
      data: {
        title: "Number of units of this type",
        description:
          "This is the number of units of this type that existed on the site before the changes.",
        fn: "identicalUnits",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title: "What best describes this unit?",
        fn: "type",
        options: [
          { id: "house", data: { text: "House", val: "house" } },
          {
            id: "flat",
            data: { text: "Flat, apartment or maisonette", val: "flat" },
          },
          {
            id: "liveWorkUnit",
            data: { text: "Live-work unit", val: "liveWorkUnit" },
          },
          {
            id: "sheltered",
            data: { text: "Sheltered housing", val: "sheltered" },
          },
          { id: "studio", data: { text: "Studio or bedsit", val: "studio" } },
          { id: "cluster", data: { text: "Cluster flat", val: "cluster" } },
          { id: "other", data: { text: "Other", val: "other" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "What best describes the tenure of this unit?",
        fn: "tenure",
        options: [
          { id: "MH", data: { text: "Market housing", val: "MH" } },
          {
            id: "SAIR",
            data: { text: "Social, affordable or interim rent", val: "SAIR" },
          },
          {
            id: "AHO",
            data: { text: "Affordable home ownership", val: "AHO" },
          },
          { id: "SH", data: { text: "Starter homes", val: "SH" } },
          {
            id: "selfCustomBuild",
            data: {
              text: "Self-build and custom build",
              val: "selfCustomBuild",
            },
          },
          { id: "other", data: { text: "Other", val: "other" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "How many bedrooms did this unit have?",
        fn: "bedrooms",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
