import Check from "@mui/icons-material/Check";
import Typography from "@mui/material/Typography";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Banner from "./Banner";

const meta = {
  title: "Design System/Atoms/Form Elements/Banner",
  component: Banner,
} satisfies Meta<typeof Banner>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    heading: "Application completed",
    Icon: Check,
    iconTitle: "Success",
    color: {
      background: "#ffdd00",
      text: "#000",
    },
    children: (
      <Typography variant="body1">This is an optional description.</Typography>
    ),
  },
} satisfies Story;
