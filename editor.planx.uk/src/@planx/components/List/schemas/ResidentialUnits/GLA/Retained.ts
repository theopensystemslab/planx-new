import { Schema } from "@planx/components/shared/Schema/model";

export const ResidentialUnitsGLARetained: Schema = {
  type: "Retained residential unit type",
  fields: [
    {
      type: "number",
      data: {
        title: "What is the number of bedrooms of this unit?",
        fn: "bedrooms",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title: "Which best describes the tenure of this unit?",
        fn: "tenure",
        options: [
          { id: "LAR", data: { text: "London Affordable Rent", val: "LAR" } },
          {
            id: "AR",
            data: {
              text: "Affordable rent (not at LAR benchmark rents)",
              val: "AR",
            },
          },
          { id: "SR", data: { text: "Social rent", val: "SR" } },
          { id: "LRR", data: { text: "London Living Rent", val: "LRR" } },
          {
            id: "sharedEquity",
            data: { text: "Shared equity", val: "sharedEquity" },
          },
          { id: "LSO", data: { text: "London Shared Ownership", val: "LSO" } },
          { id: "DMS", data: { text: "Discount market sale", val: "DMS" } },
          { id: "DMR", data: { text: "Discount market rent", val: "DMR" } },
          {
            id: "DMRLLR",
            data: {
              text: "Discount market rent (charged at London Living Rents)",
              val: "DMRLLR",
            },
          },
          {
            id: "marketForRent",
            data: { text: "Market for rent", val: "marketForRent" },
          },
          { id: "SH", data: { text: "Starter homes", val: "SH" } },
          {
            id: "selfCustomBuild",
            data: {
              text: "Self-build and custom build",
              val: "selfCustomBuild",
            },
          },
          {
            id: "marketForSale",
            data: { text: "Market for sale", val: "marketForSale" },
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
          { id: "terraced", data: { text: "Terraced home", val: "terraced" } },
          {
            id: "semiDetached",
            data: { text: "Semi detached home", val: "semiDetached" },
          },
          { id: "detached", data: { text: "Detached home", val: "detached" } },
          {
            id: "flat",
            data: { text: "Flat/apartment or maisonette", val: "flat" },
          },
          { id: "LW", data: { text: "Live/work unit", val: "LW" } },
          { id: "cluster", data: { text: "Cluster flat", val: "cluster" } },
          { id: "studio", data: { text: "Studio or bedsit", val: "studio" } },
          { id: "coLiving", data: { text: "Co living unit", val: "coLiving" } },
          { id: "hostel", data: { text: "Hostel room", val: "hostel" } },
          { id: "HMO", data: { text: "HMO", val: "HMO" } },
          {
            id: "student",
            data: { text: "Student accommodation", val: "student" },
          },
          { id: "other", data: { text: "Other", val: "other" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "How many retained units fit the descriptions above?",
        fn: "identicalUnits",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
