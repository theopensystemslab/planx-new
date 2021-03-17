import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Meta, Story } from "@storybook/react/types-6-0";
import { submitFeedback } from "lib/feedback";
import React, { useState } from "react";

import CollapsibleInput, { Props } from "./CollapsibleInput";

const metadata: Meta = {
  title: "Design System/Molecules/CollapsibleInput",
  component: CollapsibleInput,
};

export const Basic: Story<Props> = (args: Props) => {
  const [text, setText] = useState("");
  return (
    <>
      <CollapsibleInput
        {...args}
        handleChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
          setText(ev.target.value)
        }
        value={text}
        name="text"
      >
        <Typography variant="body2">
          Is this result inaccurate? <b>tell us why</b>
        </Typography>
      </CollapsibleInput>
      <Button variant="contained" onClick={() => submitFeedback(text)}>
        Submit
      </Button>
    </>
  );
};

export default metadata;
