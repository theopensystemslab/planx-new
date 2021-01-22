import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import RichTextInput from "./RichTextInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/RichTextInput",
  component: RichTextInput,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Basic = () => {
  const [value, setValue] = useState<string>(
    "<p>Hello, <a href='https://opensystemslab.org'>OSL</a></p>"
  );

  return (
    <Box marginTop={3}>
      <Button
        onClick={() => {
          setValue("I am reset");
        }}
      >
        Reset from the outside
      </Button>
      <RichTextInput
        placeholder="Add something"
        value={value}
        onChange={(ev) => {
          setValue(ev.target.value);
        }}
      />
      <Box>
        <p>HTML result:</p>
        <pre>{value}</pre>
      </Box>
    </Box>
  );
};

export default metadata;
