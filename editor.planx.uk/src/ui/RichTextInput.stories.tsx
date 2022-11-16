import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Meta } from "@storybook/react/types-6-0";
import { range } from "ramda";
import React, { useState } from "react";

import Input from "./Input";
import ListManager from "./ListManager";
import RichTextInput, { fromHtml } from "./RichTextInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/RichTextInput",
  component: RichTextInput,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export default metadata;

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

interface Item {
  title: string;
  body: string;
  enabled: boolean;
}

const ItemEditor: React.FC<{
  value: Item;
  onChange: (newValue: Item) => void;
}> = (props) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack spacing={0.5}>
        <Input
          value={props.value.title}
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              title: ev.target.value,
            });
          }}
        />
        <RichTextInput
          placeholder="Add something"
          value={props.value.body}
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              body: ev.target.value,
            });
          }}
        />
      </Stack>
    </Box>
  );
};

export const Performance = () => {
  const [items, setItems] = useState<Item[]>(
    range(0, 200).map(() => ({
      title: "Title",
      body: "Body",
      enabled: true,
    }))
  );
  return (
    <ListManager
      values={items}
      onChange={setItems}
      newValue={() => ({ title: "", body: "", enabled: false })}
      Editor={ItemEditor}
    ></ListManager>
  );
};
