import type { Meta, StoryObj } from "@storybook/tanstack-react";

import DowntimeBanner from "./DowntimeBanner";

const meta = {
  title: "Design System/Molecules/DowntimeBanner",
  component: DowntimeBanner,
} satisfies Meta<typeof DowntimeBanner>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  render: () => <DowntimeBanner />,
} satisfies Story;
