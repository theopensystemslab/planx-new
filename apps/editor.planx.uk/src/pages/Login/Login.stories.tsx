import type { Meta, StoryObj } from "@storybook/tanstack-react";

import Login from "./Login";

const meta = {
  title: "Design System/Pages/EditorLogin",
  component: Login,
} satisfies Meta<typeof Login>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  render: () => <Login />,
} satisfies Story;
