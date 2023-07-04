import FeedbackInput from "@planx/components/shared/FeedbackInput";
import { Meta, StoryFn } from "@storybook/react";
import React, { useState } from "react";

import CollapsibleInput, { Props } from "./CollapsibleInput";

const metadata: Meta = {
  title: "Design System/Molecules/CollapsibleInput",
  component: CollapsibleInput,
};

export const Basic: StoryFn<Props> = (_args: Props) => {
  const [text, setText] = useState("");
  return (
    <FeedbackInput
      text="Is this result inaccurate? **tell us why**"
      handleChange={(ev) => {
        setText(ev.target.value);
      }}
      value={text}
    />
  );
};

export default metadata;
