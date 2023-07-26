import FeedbackInput from "@planx/components/shared/FeedbackInput";
import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";

import CollapsibleInput, { Props } from "./CollapsibleInput";

const meta = {
  title: "Design System/Atoms/Form Elements/CollapsibleInput",
  component: CollapsibleInput,
} satisfies Meta<typeof CollapsibleInput>;

export default meta;

type Story = StoryObj<typeof meta>;

// TODO clarify use of args.children versus render here
export const Basic = {
  args: {
    name: "Feedback",
    value: "feedback",
    children: <p>This is a child element.</p>,
    ariaLabel: "Feedback",
  },
  render: (_args: Props) => {
    const [text, setText] = useState("");
    return (
      <FeedbackInput
        text="Is this result inaccurate? **Tell us why**"
        handleChange={(ev) => {
          setText(ev.target.value);
        }}
        value={text}
      />
    );
  },
} satisfies Story;
