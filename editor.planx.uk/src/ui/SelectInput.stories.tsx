import MenuItem from "@mui/material/MenuItem";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import SelectInput from "ui/SelectInput";

const meta = {
  title: "Design System/Atoms/Form Elements/SelectInput",
  component: SelectInput,
} satisfies Meta<typeof SelectInput>;

type Story = StoryObj<typeof SelectInput>;

export default meta;

export const Basic = {
  args: {
    value: "admin",
    children: (
      <>
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Read</MenuItem>
      </>
    ),
  },
} satisfies Story;
