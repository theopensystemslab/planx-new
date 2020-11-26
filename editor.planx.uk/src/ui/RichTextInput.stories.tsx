import Box from "@material-ui/core/Box";
import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import RichTextInput from "./RichTextInput";

export default {
  title: "Design System/Atoms/RichTextInput",
  component: RichTextInput,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta;

export const Basic = () => {
  const [value, setValue] = useState<string>();
  return (
    <Box marginTop={3}>
      <RichTextInput
        value={value}
        onChange={(ev) => {
          setValue(ev.target.value);
        }}
      />
      <Box>
        <p>Markdown result:</p>
        <pre>{value}</pre>
      </Box>
    </Box>
  );
};
