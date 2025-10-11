import Box from "@mui/material/Box";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { mockSubmissions } from "../mockSubmissions";
import EventsLog from "./EventsLog";

const meta = {
  title: "Editor Components/Submissions/Events log",
  component: EventsLog,
  decorators: [
    (Story) => (
      <Box sx={{ height: "500px" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EventsLog>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    loading: false,
    submissions: mockSubmissions,
    error: undefined,
  },
} satisfies Story;
