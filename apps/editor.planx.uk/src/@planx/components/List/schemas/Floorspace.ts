import { Schema } from "@planx/components/shared/Schema/model";

export const NonResidentialFloorspace: Schema = {
  type: "Non-residential floorspace",
  fields: [
    {
      type: "question",
      data: {
        title: "Use class or type",
        fn: "useClass",
        options: [
          { id: "bTwo", data: { text: "B2 - General industry", val: "bTwo" } },
          {
            id: "bEight",
            data: { text: "B8 - Storage and distribution", val: "bEight" },
          },
          { id: "cOne", data: { text: "C1 - Hotels", val: "cOne" } },
          {
            id: "cTwo",
            data: { text: "C2 - Residential institutions", val: "cTwo" },
          },
          {
            id: "cTwoA",
            data: {
              text: "C2a - Secure residential institutions",
              val: "cTwoA",
            },
          },
          {
            id: "eAShops",
            data: {
              text: "E(a) - Retail (other than hot food): Shops",
              val: "eAShops",
            },
          },
          {
            id: "eANetTradeableArea",
            data: {
              text: "E(a) - Retail (other than hot food): Net tradeable area",
              val: "eANetTradeableArea",
            },
          },
          {
            id: "eB",
            data: {
              text: "E(b) - Sale of food and drink (mostly consumed on the premises)",
              val: "eB",
            },
          },
          {
            id: "eCI",
            data: { text: "E(c)(i) - Financial services", val: "eCI" },
          },
          {
            id: "eCII",
            data: {
              text: "E(c)(ii) - Professional services (other than health or medical)",
              val: "eCII",
            },
          },
          {
            id: "eCIII",
            data: { text: "E(c)(iii) - Any other service", val: "eCIII" },
          },
          {
            id: "eD",
            data: {
              text: "E(d) - Indoor sports, recreation or fitness",
              val: "eD",
            },
          },
          {
            id: "eF",
            data: { text: "E(f) - Creche or day nursery", val: "eF" },
          },
          {
            id: "eGI",
            data: {
              text: "E(g)(i) - Office (to carry out operational or administrative functions)",
              val: "eGI",
            },
          },
          {
            id: "eGII",
            data: {
              text: "E(g)(ii) - Research and development of products or processes",
              val: "eGII",
            },
          },
          {
            id: "eGIII",
            data: {
              text: "E(g)(iii) - Any industrial process (can be carried out within a residential area)",
              val: "eGIII",
            },
          },
          {
            id: "fOneA",
            data: {
              text: "F1(a) - Education",
              val: "fOneA",
            },
          },
          {
            id: "fOneB",
            data: {
              text: "F1(b) - Display works of art",
              val: "fOneB",
            },
          },
          {
            id: "fOneC",
            data: {
              text: "F1(c) - Museum",
              val: "fOneC",
            },
          },
          {
            id: "fOneD",
            data: {
              text: "F1(d) - Public library",
              val: "fOneD",
            },
          },
          {
            id: "fOneE",
            data: {
              text: "F1(e) - Public hall or exhibition hall",
              val: "fOneE",
            },
          },
          {
            id: "fOneF",
            data: {
              text: "F1(f) - Public worship or religious instruction",
              val: "fOneF",
            },
          },
          {
            id: "fOneG",
            data: {
              text: "F1(g) - Law court",
              val: "fOneG",
            },
          },
          {
            id: "fTwoA",
            data: {
              text: "F2(a) - Shop selling essential goods (not over 280sqm and no other such facility in 1000m radius)",
              val: "fTwoA",
            },
          },
          {
            id: "fTwoB",
            data: {
              text: "F2(b) - Hall or meeting place for local community (principal use)",
              val: "fTwoB",
            },
          },
          {
            id: "fTwoC",
            data: { text: "F2(c) - Outdoor sport or recreation", val: "fTwoC" },
          },
          {
            id: "fTwoD",
            data: {
              text: "F2(d) - Indoor or outdoor swimming pool or skating rink",
              val: "fTwoD",
            },
          },
          { id: "other", data: { text: "Other", val: "other" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "What is the existing gross internal floor area?",
        units: "m²",
        fn: "area.existing",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title:
          "What is the gross internal floor area to be lost by change of use or demolition?",
        units: "m²",
        fn: "area.loss",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title:
          "What is the total gross internal floor area proposed (including change of use)?",
        units: "m²",
        fn: "area.proposed",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
