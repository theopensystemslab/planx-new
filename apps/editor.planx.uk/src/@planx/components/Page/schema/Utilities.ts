import { PageSchema } from "../model";

export const UtilitiesGLA: PageSchema = {
  type: "Utilities",
  fields: [
    {
      type: "question",
      data: {
        title: "Will there be any new automatic fire extinguishers?",
        fn: "utilities.fireSuppression",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "Will there be any new heat pumps?",
        fn: "utilities.heatPump",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "How many litres of water will each resident use a day?",
        description:
          "This is known as the targeted residential water usage and is sometimes called l/p/d.",
        fn: "residentialWaterUsage",
        units: "litres",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new water connections",
        fn: "utilities.water.connections",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new gas connections",
        fn: "utilities.gas.connections",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new homes with full fibre internet connection",
        fn: "utilities.internet.residentialUnits",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title:
          "Number of new commercial units with full fibre internet connection",
        fn: "utilities.internet.commercialUnits",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title: "Have you consulted mobile network operators?",
        fn: "utilities.mobileNetworkOperators.consulted",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
  ],
  min: 1,
  max: 1,
} as const;
