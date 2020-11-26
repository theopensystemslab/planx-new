import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/TaskList",
  component: Public,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: true },
  },
} as Meta;

export const Frontend = (args) => <Public {...args} />;
Frontend.args = {
  tasks: [
    { title: "Do this first", description: "It's a very important task." },
    { title: "Do this next", description: "It's also very important." },
    {
      title: "Don't forget this",
      description: "It's the most important of all.",
    },
  ],
};

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
