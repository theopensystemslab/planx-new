import type { Meta, StoryObj } from "@storybook/tanstack-react";

import ErrorPage from "./ErrorPage";

const meta = {
  title: "Design System/Pages/Error",
  component: ErrorPage,
} satisfies Meta<typeof ErrorPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    title: "Something's gone wrong",
  },
} satisfies Story;
