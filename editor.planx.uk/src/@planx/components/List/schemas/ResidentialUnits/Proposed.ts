import { Schema } from "@planx/components/shared/Schema/model";

export const ResidentialUnitsProposed: Schema = {
  type: "Proposed residential unit type",
  fields: [
    {
      type: "number",
      data: {
        title: "Number of units of this type",
        description:
          "This is the total number of units of this type that will be on the site after the changes.",
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
        title: "How many bedrooms will this unit have?",
        fn: "bedrooms",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
