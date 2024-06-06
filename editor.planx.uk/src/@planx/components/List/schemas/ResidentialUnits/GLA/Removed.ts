import { Schema } from "@planx/components/List/model";

export const ResidentialUnitsGLARemoved: Schema = {
  type: "Removed residential unit",
  fields: [
    {
      type: "number",
      data: {
        title: "What is the number of habitable rooms of this unit?",
        fn: "habitable",
        allowNegatives: false,
      },
    },
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
      type: "checklist",
      data: {
        title: "Is this unit compliant with any of the following?",
        fn: "compliance",
        options: [
          {
            id: "m42",
            data: { text: "Part M4(2) of the Building Regulations 2010" },
          },
          {
            id: "m432a",
            data: { text: "Part M4(3)(2a) of the Building Regulations 2010" },
          },
          {
            id: "m432b",
            data: { text: "Part M4(3)(2b) of the Building Regulations 2010" },
          },
          { id: "none", data: { text: "None of these" } },
        ],
      },
    },
    // {
    //   type: "question", // checklist
    //   data: {
    //     title: "Will this unit comply with M4(2)?",
    //     fn: "m42Compliance",
    //     options: [
    //       { id: "yes", data: { text: "Yes" } },
    //       { id: "no", data: { text: "No" } },
    //     ],
    //   },
    // },
    // {
    //   type: "question", // checklist
    //   data: {
    //     title: "Will this unit comply with M4(3)(2a)?",
    //     fn: "m432aCompliance",
    //     options: [
    //       { id: "yes", data: { text: "Yes" } },
    //       { id: "no", data: { text: "No" } },
    //     ],
    //   },
    // },
    // {
    //   type: "question", // checklist
    //   data: {
    //     title: "Will this unit comply with M4(3)(2b)?",
    //     fn: "m432bCompliance",
    //     options: [
    //       { id: "yes", data: { text: "Yes" } },
    //       { id: "no", data: { text: "No" } },
    //     ],
    //   },
    // },
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
      type: "question",
      data: {
        title: "What best describes the provider of this unit?",
        fn: "provider",
        options: [
          { id: "private", data: { text: "Private" } },
          { id: "privateRented", data: { text: "Private rented sector" } },
          { id: "HA", data: { text: "Housing association" } },
          { id: "LA", data: { text: "Local authority" } },
          { id: "publicAuthority", data: { text: "Other public authority" } },
          { id: "councilDelivery", data: { text: "Council delivery company" } },
          {
            id: "councilBuildToRent",
            data: { text: "Council delivered build to rent" },
          },
          {
            id: "affordableHousing",
            data: { text: "Other affordable housing provider" },
          },
          { id: "selfBuild", data: { text: "Self-build" } },
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
      type: "question",
      data: {
        title: "Will this unit provide sheltered accommodation?",
        fn: "sheltered",
        options: [
          { id: "true", data: { text: "Yes" } },
          { id: "false", data: { text: "No" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "Is this unit specifically designed for older people?",
        fn: "olderPersons",
        options: [
          { id: "true", data: { text: "Yes" } },
          { id: "false", data: { text: "No" } },
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
