import { Schema } from "../../model";

export const ResidentialUnitsProposed: Schema = {
  type: "Proposed residential unit",
  fields: [
    {
      type: "question",
      data: {
        title: "What development does this unit result from?",
        fn: "development",
        options: [
          { id: "newBuild", data: { text: "New build", val: "newBuild" } },
          {
            id: "changeOfUseFrom",
            data: {
              text: "Change of use of existing single home",
              val: "changeOfUseFrom",
            },
          },
          {
            id: "changeOfUseTo",
            data: { text: "Change of use to a home", val: "changeOfUseTo" },
          },
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
      type: "question",
      data: {
        title: "What best describes the type of this unit?",
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
      type: "number",
      data: {
        title: "How many bedrooms will this unit have?",
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
