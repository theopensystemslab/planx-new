import { PageSchema } from "../model";

export const UtilitiesGLA: PageSchema = {
  type: "Utilities",
  fields: [
    {
      type: "question",
      data: {
        title: "Does the development propose any fire suppression systems?",
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
        title: "Does the development propose any heat pumps?",
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
        title: "What is the targeted internal residential water usage?",
        description:
          "Enter a number that describes the litres per person per day (sometimes called l/p/d).",
        fn: "residentialWaterUsage",
        units: "litres",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new water connections required",
        fn: "utilities.water.connections",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new gas connections required",
        fn: "utilities.gas.connections",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of homes served by full fibre internet connection",
        fn: "utilities.internet.residentialUnits",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title:
          "Number of commercial units served by full fibre internet connection",
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
