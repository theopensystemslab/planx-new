import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import RichTextInput, { fromHtml, injectVariables } from "./RichTextInput";

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
    <Grid container>
      <Grid item xs={4}>
        <Button
          variant="outlined"
          onClick={() => {
            setValue(
              `<p>Hello, and <span data-type="mention" class="pass" data-id="Apples">@Apples</span> <a target="_blank" rel="noopener noreferrer nofollow" href="https://opensystemslab.org">OSL</a></p>`
            );
          }}
        >
          Reset from the outside
        </Button>
      </Grid>
      <Grid item xs={8}>
        <Stack spacing={4}>
          <Box>
            <p>Editor</p>
            <RichTextInput
              placeholder="Add something"
              value={value}
              onChange={(ev) => {
                setValue(ev.target.value);
              }}
            />
          </Box>
          <Box>
            <p>HTML result:</p>
            <textarea
              style={{ display: "block", width: "100%", height: 120 }}
              value={value}
              readOnly
            />
          </Box>
          <Box>
            <p>Interpolated HTML result:</p>
            <textarea
              style={{ display: "block", width: "100%", height: 120 }}
              value={injectVariables(value, { name: "Gary" })}
              readOnly
            />
          </Box>
          <Box>
            <p>JSON result:</p>
            <textarea
              style={{ display: "block", width: "100%", height: 120 }}
              value={JSON.stringify(fromHtml(value), null, 2)}
              readOnly
            />
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default metadata;
