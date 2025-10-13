import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import { PresentationalProps } from "./model";
import { Presentational as Public } from "./Public";

const meta = {
  title: "PlanX Components/Result",
  component: Public,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: true },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

const props: PresentationalProps = {
  headingColor: {
    background: "#ADFF00",
    text: "#000",
  },
  headingTitle: "Heading",
  description: "Description",
  reasonsTitle: "Reasons",
  allowChanges: true,
  responses: [
    {
      question: {
        id: "1234",
        data: {
          text: "A question with no further information",
        },
      },
      selections: [
        {
          id: "5678",
          data: {
            text: "answer",
          },
        },
      ],
      hidden: false,
    },
    {
      question: {
        id: "9999",
        data: {
          text: "A question with more information",
          info: "some more information",
        },
      },
      selections: [
        {
          id: "8888",
          data: {
            text: "answer",
          },
        },
      ],
      hidden: false,
    },
    {
      question: {
        id: "7777",
        data: {
          text: "A question with a policy reference",
          policyRef: "https://beta.planx.uk/southwark",
        },
      },
      selections: [
        {
          id: "6666",
          data: {
            text: "answer",
          },
        },
      ],
      hidden: false,
    },
    {
      question: {
        id: "5555",
        data: {
          text: "A question with more information and a policy reference",
          info: "Some more information",
          policyRef: "https://beta.planx.uk/southwark",
        },
      },
      selections: [
        {
          id: "4444",
          data: {
            text: "answer",
          },
        },
      ],
      hidden: false,
    },
    {
      question: {
        id: "3333",
        data: {
          text: "A question with more information and a policy reference and it's really long",
          info: "Some more information",
          policyRef: "https://beta.planx.uk/southwark",
        },
      },
      selections: [
        {
          id: "2222",
          data: {
            text: "answer is also really, really long",
          },
        },
      ],
      hidden: false,
    },
  ],
};

export const Basic = {
  args: props,
} satisfies Story;

export const WithDisclaimer = {
  args: {
    headingTitle: "Heading",
    headingColor: { background: "palegoldenrod", text: "black" },
    reasonsTitle: "Reasons",
    allowChanges: true,
    disclaimer: {
      heading: "For guidance only",
      content: "Proceed at your own risk!",
      show: true,
    },
    responses: [
      {
        question: {
          id: "1234",
          data: {
            text: "A question with no further information",
          },
        },
        selections: [
          {
            id: "5678",
            data: {
              text: "answer",
            },
          },
        ],
        hidden: false,
      },
    ],
  },
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={() => <Public {...props} />} />;
};