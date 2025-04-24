import { PageSchema } from "../model";

export const UtilitiesGLA: PageSchema = {
  type: "Utilities",
  fields: [
    {
      type: "checklist",
      required: false,
      data: {
        title: "Does the development provide any of the following?",
        fn: "utilities",
        options: [
          {
            id: "fireSuppression",
            data: { text: "Fire suppression systems", val: "fireSuppression" },
          },
          {
            id: "communityOwned",
            data: {
              text: "On-site community-owned energy generation",
              val: "communityOwned",
            },
          },
          { id: "solar", data: { text: "Solar energy", val: "solar" } },
          { id: "heatPump", data: { text: "Heat pumps", val: "heatPump" } },
        ],
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new water connections required",
        fn: "proposal.utilities.water.connections",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of new gas connections required",
        fn: "proposal.utilities.gas.connections",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "Number of homes served by full fibre internet connection",
        fn: "proposal.utilities.internet.residentialUnits",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title:
          "Number of commercial units served by full fibre internet connection",
        fn: "proposal.utilities.internet.commercialUnits",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title: "Have you consulted mobile network operators?",
        fn: "flood.greenSuDS",
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
