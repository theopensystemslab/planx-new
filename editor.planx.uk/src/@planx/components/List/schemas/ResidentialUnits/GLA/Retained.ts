import { Schema } from "@planx/components/List/model";

export const ResidentialUnitsGLARetained: Schema = {
  type: "Retained residential unit",
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
          { id: "LAR", data: { text: "London Affordable Rent" } },
          {
            id: "AR",
            data: { text: "Affordable rent (not at LAR benchmark rents)" },
          },
          { id: "SR", data: { text: "Social rent" } },
          { id: "LRR", data: { text: "London Living Rent" } },
          { id: "sharedEquity", data: { text: "Shared equity" } },
          { id: "LSO", data: { text: "London Shared Ownership" } },
          { id: "DMS", data: { text: "Discount market sale" } },
          { id: "DMR", data: { text: "Discount market rent" } },
          {
            id: "DMRLLR",
            data: {
              text: "Discount market rent (charged at London Living Rents)",
            },
          },
          { id: "marketForRent", data: { text: "Market for rent" } },
          { id: "SH", data: { text: "Starter homes" } },
          {
            id: "selfCustomBuild",
            data: { text: "Self-build and custom build" },
          },
          { id: "marketForSale", data: { text: "Market for sale" } },
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
          { id: "terraced", data: { text: "Terraced home" } },
          { id: "semiDetached", data: { text: "Semi detached home" } },
          { id: "detached", data: { text: "Detached home" } },
          { id: "flat", data: { text: "Flat/apartment or maisonette" } },
          { id: "LW", data: { text: "Live/work unit" } },
          { id: "cluster", data: { text: "Cluster flat" } },
          { id: "studio", data: { text: "Studio or bedsit" } },
          { id: "coLiving", data: { text: "Co living unit" } },
          { id: "hostel", data: { text: "Hostel room" } },
          { id: "HMO", data: { text: "HMO" } },
          { id: "student", data: { text: "Student accomodation" } },
          { id: "other", data: { text: "Other" } },
        ],
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
