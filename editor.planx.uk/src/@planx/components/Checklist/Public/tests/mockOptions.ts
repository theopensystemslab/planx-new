import { Option } from "@planx/components/shared";

import { ChecklistLayout, Group } from "../../model";

export const options: {
  [key in ChecklistLayout]?: Array<Option>;
} = {
  [ChecklistLayout.Basic]: [
    {
      id: "flat_id",
      data: {
        text: "Flat",
      },
    },
    {
      id: "caravan_id",
      data: {
        text: "Caravan",
        description: "A caravan is a temporary structure.",
      },
    },
    {
      id: "house_id",
      data: {
        text: "House",
        description: "A house can be detached, semi-detached or terraced.",
      },
    },
    {
      id: "spaceship_id",
      data: {
        text: "Spaceship",
      },
    },
  ],
  [ChecklistLayout.Images]: [
    {
      id: "flat_id",
      data: {
        text: "Flat",
        img: "flat.jpg",
      },
    },
    {
      id: "caravan_id",
      data: {
        text: "Caravan",
        img: "caravan.jpg",
      },
    },
    {
      id: "house_id",
      data: {
        text: "House",
        img: "house.jpg",
      },
    },
    {
      id: "spaceship_id",
      data: {
        text: "Spaceship",
        img: "spaceship.jpg",
      },
    },
  ],
};

export const optionsWithExclusiveOption: Array<Option> = [
  ...(options[ChecklistLayout.Basic] || []),
  { id: "tent_id", data: { text: "Tent", exclusive: true } },
];

export const groupedOptions: Array<Group<Option>> = [
  {
    title: "Section 1",
    children: [
      {
        id: "S1_Option1",
        data: {
          text: "S1 Option1",
        },
      },
      {
        id: "S1_Option2",
        data: {
          text: "S1 Option2",
          description: "S1 Option2 has a description",
        },
      },
    ],
  },
  {
    title: "Section 2",
    children: [
      {
        id: "S2_Option1",
        data: {
          text: "S2 Option1",
        },
      },
      {
        id: "S2_Option2",
        data: {
          text: "S2 Option2",
        },
      },
    ],
  },
  {
    title: "Section 3",
    children: [
      {
        id: "S3_Option1",
        data: {
          text: "S3 Option1",
        },
      },
      {
        id: "S3_Option2",
        data: {
          text: "S3 Option2",
        },
      },
    ],
  },
];

export const groupedOptionsWithExclusiveOption: Array<Group<Option>> = [
  {
    title: "Section 1",
    children: [
      {
        id: "S1_Option1",
        data: {
          text: "S1 Option1",
        },
      },
    ],
  },
  {
    title: "Section 2",
    children: [
      {
        id: "S2_Option1",
        data: {
          text: "S2 Option1",
        },
      },
      {
        id: "S2_Option2",
        data: {
          text: "S2 Option2",
        },
      },
    ],
  },
  {
    title: "Exclusive 'Or' Option",
    exclusive: true,
    children: [
      {
        id: "exclusive_option",
        data: {
          text: "Exclusive",
          exclusive: true,
        },
      },
    ],
  },
];
