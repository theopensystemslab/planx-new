import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Content",
  component: Public,
  argTypes: {
    handleSubmit: { action: true },
  },
} satisfies Meta<typeof Public>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    content: `<h1>Ready to submit?</h1><p>You will not be able to make any further changes.You will not be able to make any further changes.</p>`,
    color: "#F9F8F8",
  },
} satisfies Story;

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
