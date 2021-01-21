import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import Public, { Props } from "./Public";

const metadata: Meta = {
  title: "PlanX Components/Result",
  component: Public,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: true },
  },
};

export const Frontend: Story<Props> = (args) => <Public {...args} />;
Frontend.args = {
  headingColor: {
    background: "hotpink",
    text: "#fff",
  },
  headingTitle: "Heading",
  subheading: "Subheading",
  headingDescription: "Further description",
  reasonsTitle: "Reasons",
  responses: [
    {
      question: {
        id: "1234",
        data: {
          text: "hihihi",
        },
      },
      selections: [
        {
          id: "5678",
          data: {
            text: "bye",
          },
        },
      ],
      hidden: false,
    },
  ],
};

export default metadata;
