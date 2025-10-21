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

export const WithImage = {
  args: {
    content: `<h1>What should planning drawings look like?</h1><img src="https://user-data-8038f15.s3.eu-west-2.amazonaws.com/kbqmvxh3/Floor%20plans%20proposed.svg" alt="Planning drawing"><p><strong>Do</strong></p><ul><li><p>Draw to scale, for example 1:100</p></li><li><p>Indicate which direction is north</p></li><li><p>Include a unique reference number</p></li></ul><p><strong>Do not</strong></p><ul><li><p>Take photographs of paper drawings</p></li><li><p>Add poor quality scans</p></li></ul>`,
    color: "#FFF",
  },
} satisfies Story;

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
