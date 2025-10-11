import { Schema } from "@planx/components/shared/Schema/model";

export const ParkingGLA: Schema = {
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
            id: "cycles",
            data: {
              text: "Bicycles",
              val: "cycles",
            },
          },
          {
            id: "bus",
            data: {
              text: "Buses",
              val: "bus",
            },
          },
          {
            id: "disabled",
            data: { text: "Disabled person parking", val: "disabled" },
          },
          {
            id: "carClub",
            data: {
              text: "Car club",
              val: "carClub",
            },
          },
          {
            id: "offStreet.residential",
            data: {
              text: "Residential off-street parking",
              val: "offStreet.residential",
            },
          },
          {
            id: "other",
            data: {
              text: "Other",
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
