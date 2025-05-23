import { PageSchema } from "../model";

export const EnvironmentGLA: PageSchema = {
  type: "Environmental management",
  fields: [
    {
      type: "checklist",
      required: false,
      data: {
        title: "Does the development include any of the following?",
        fn: "water",
        options: [
          {
            id: "greyWaterReuse",
            data: { text: "Grey water reuse", val: "greyWaterReuse" },
          },
          {
            id: "rainWaterHarvesting",
            data: { text: "Rain water harvesting", val: "rainWaterHarvesting" },
          },
          {
            id: "greenSuDS",
            data: {
              text: "Green sustainable drainage systems",
              val: "greenSuDS",
            },
          },
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
        title:
          "What is the percentage reduction of surface water discharge from the site for a 1 in 100-year rainfall event?",
        fn: "flood.dischargeReduction",
        units: "percent",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "What is the Urban Greening Factor Score?",
        description: "See 'More information' for how to calculate this score.",
        fn: "urbanGreeningFactor",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "What area of green roof is proposed?",
        fn: "greenRoof.area",
        units: "m²",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title: "What are the total annual NOx emissions of the proposal?",
        description:
          "This information will be available from an Air Quality Assessment.",
        fn: "pollution.NOx.annual",
        units: "kilograms",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title:
          "What are the total annual particulate-matter emissions of the proposal?",
        description:
          "This information will be available from an Air Quality Assessment.",
        fn: "pollution.PM.annual",
        units: "kilograms",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      required: false,
      data: {
        title:
          "What percentage of material from demolition and construction will be re-used or recycled?",
        fn: "waste.reuseRecycle",
        units: "percent",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
  max: 1,
} as const;
