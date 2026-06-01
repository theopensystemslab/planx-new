import { Meta, StoryObj } from "@storybook/react-vite";

import AnalyticsDisabledBanner from "./AnalyticsDisabledBanner";

const meta = {
  title: "Design System/Molecules/AnalyticsDisabledBanner",
  component: AnalyticsDisabledBanner,
} satisfies Meta<typeof AnalyticsDisabledBanner>;

type Story = StoryObj<typeof meta>;

export default meta;

/** Add `&analytics=false` to the end this page's URL to display the banner */
export const Basic = {
  render: () => <AnalyticsDisabledBanner />,
} satisfies Story;
