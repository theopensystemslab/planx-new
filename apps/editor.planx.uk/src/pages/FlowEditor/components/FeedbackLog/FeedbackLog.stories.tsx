import Box from "@mui/material/Box";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { FeedbackLog } from "./FeedbackLog";
import { mockFeedback } from "./mocks/mockFeedback";

const meta = {
  title: "Editor Components/Feedback/Feedback log",
  component: FeedbackLog,
  decorators: [
    (Story) => (
      <Box sx={{ height: "500px" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FeedbackLog>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    feedback: mockFeedback,
  },
} satisfies Story;
