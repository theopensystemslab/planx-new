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

export const WithMoreInformation = {
  render: () => (
    <DowntimeBanner
      title="Planned maintenance - PlanX will be unavailable between 6pm and 8pm today."
      description="<p>We are upgrading our infrastructure. Any applications in progress will be saved.</p>"
    />
  ),
} satisfies Story;
