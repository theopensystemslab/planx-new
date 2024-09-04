import { Schema } from "@planx/components/shared/Schema/model";

export const Parking: Schema = {
  type: "Parking space type",
  fields: [
    {
      type: "question",
      data: {
        title: "Type",
        fn: "type",
        options: [
          { id: "cars", data: { text: "Cars", val: "cars" } },
          {
            id: "vans",
            data: { text: "Vans or minibuses", val: "vans" },
          },
          {
            id: "motorcycles",
            data: { text: "Motorcycles", val: "motorcycles" },
          },
          {
            id: "disabled",
            data: { text: "Disabled person parking", val: "disabled" },
          },
          {
            id: "cycles",
            data: {
              text: "Bicycles",
              val: "cycles",
            },
          },
          {
            id: "other",
            data: {
              text: "Other (e.g. bus)",
              val: "other",
            },
          },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "How many existing spaces of this type are there on the site?",
        fn: "existing",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many spaces of this type are you proposing?",
        description:
          "This is the total number of parking spaces of this type after the works, including any retained spaces.",
        fn: "proposed",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;