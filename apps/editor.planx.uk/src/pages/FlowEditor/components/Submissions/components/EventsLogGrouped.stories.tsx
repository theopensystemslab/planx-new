import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { mockSubmissionsGrouped } from "../mockSubmissionsGrouped";
import EventsLogGrouped from "./EventsLogGrouped";

const meta = {
  title: "Editor Components/Submissions/Events log grouped",
  component: EventsLogGrouped,
  decorators: [
    (Story) => (
      <Box sx={{ height: "500px" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EventsLogGrouped>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    loading: false,
    submissions: mockSubmissionsGrouped,
    error: undefined,
  },
} satisfies Story;
