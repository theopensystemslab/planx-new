import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/TaskList",
  component: Public,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: true },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    title: "Your Next Steps",
    description: "To reverse climate change",
    tasks: [
      { title: "Do this first", description: "It's a very important task." },
      { title: "Do this next", description: "It's also very important." },
      {
        title: "Don't forget this",
        description: "It's the most important of all.",
      },
    ],
  },
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
