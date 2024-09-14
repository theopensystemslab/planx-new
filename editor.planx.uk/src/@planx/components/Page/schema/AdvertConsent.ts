import { PageSchema } from "../model";

export const ProposedAdvertisements: PageSchema = {
  type: "Proposed advertisements",
  fields: [
    {
      type: "number",
      data: {
        title: "How many fascia signs are you applying for?",
        fn: "fascia",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many projecting or hanging signs are you applying for?",
        fn: "projecting",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many hoardings are you applying for?",
        fn: "hoarding",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "How many other advertisements are you applying for?",
        fn: "other",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
  max: 1,
} as const;
