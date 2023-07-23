import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Section",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

// Needs internal state
export const Basic = {
  args: {
    title: "The property",
  },
} satisfies Story;

export const WithEditor = () => {
  return <Wrapper Editor={Editor} Public={Public} />;
};
