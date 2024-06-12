import { Schema } from "@planx/components/List/model";

import { Props } from "../../Public";

export const MaxOneTest: Schema = {
  type: "Parking spaces",
  fields: [
    {
      type: "number",
      data: {
        title: "How many parking spaces for cars?",
        fn: "cars",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many parking spaces for bicycles?",
        fn: "bikes",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many parking spaces for caravans?",
        fn: "caravans",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
  max: 1,
} as const;

export const mockMaxOneProps: Props = {
  fn: "proposal.parking",
  schema: MaxOneTest,
  schemaName: "Parking spaces",
  title: "Describe parking spaces",
};

export const mockMaxOnePayload = {
  data: {
    "proposal.parking": [
      {
        cars: 2,
        bicycles: 4,
        caravans: 0,
      },
    ],
    "proposal.parking.one.cars": 2,
    "proposal.parking.one.bicycles": 4,
    "proposal.parking.one.caravans": 0,
    "proposal.parking.total.listItems": 1,
  },
};
