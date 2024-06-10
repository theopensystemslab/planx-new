import { Schema } from "@planx/components/List/model";

export const ResidentialUnitsGLARebuilt: Schema = {
  type: "Rebuilt residential unit",
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
    // {
    //   type: "checklist", // @todo
    //   data: {
    //     title: "Is this unit compliant with any of the following?",
    //     fn: "compliance",
    //     options: [
    //       {
    //         id: "m42",
    //         data: { text: "Part M4(2) of the Building Regulations 2010" },
    //       },
    //       {
    //         id: "m432a",
    //         data: { text: "Part M4(3)(2a) of the Building Regulations 2010" },
    //       },
    //       {
    //         id: "m432b",
    //         data: { text: "Part M4(3)(2b) of the Building Regulations 2010" },
    //       },
    //       { id: "none", data: { text: "None of these" } },
    //     ],
    //   },
    // },
    {
      type: "question",
      data: {
        title:
          "Is this unit compliant with Part M4(2) of the Building Regulations 2010?",
        fn: "complianceM42", // compliance.m42
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title:
          "Is this unit compliant with Part M4(3)(2a) of the Building Regulations 2010?",
        fn: "complianceM432a", // compliance.m432a
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title:
          "Is this unit compliant with Part M4(3)(2b) of the Building Regulations 2010?",
        fn: "complianceM432b", // compliance.m432b
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
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
            data: { text: "Student accomodation", val: "student" },
          },
          { id: "other", data: { text: "Other", val: "other" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "What best describes the provider of this unit?",
        fn: "provider",
        options: [
          { id: "private", data: { text: "Private", val: "private" } },
          {
            id: "privateRented",
            data: { text: "Private rented sector", val: "privateRented" },
          },
          { id: "HA", data: { text: "Housing association", val: "HA" } },
          { id: "LA", data: { text: "Local authority", val: "LA" } },
          {
            id: "publicAuthority",
            data: { text: "Other public authority", val: "publicAuthority" },
          },
          {
            id: "councilDelivery",
            data: { text: "Council delivery company", val: "councilDelivery" },
          },
          {
            id: "councilBuildToRent",
            data: {
              text: "Council delivered build to rent",
              val: "councilBuildToRent",
            },
          },
          {
            id: "affordableHousing",
            data: {
              text: "Other affordable housing provider",
              val: "affordableHousing",
            },
          },
          { id: "selfBuild", data: { text: "Self-build", val: "selfBuild" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "Is this unit built on garden land?",
        fn: "garden",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
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
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "Is this unit specifically designed for older people?",
        fn: "olderPersons",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
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
