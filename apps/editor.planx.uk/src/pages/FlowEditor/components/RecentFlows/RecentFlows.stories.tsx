import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import RecentFlows from "./RecentFlows";

const meta: Meta<typeof RecentFlows> = {
  title: "Design System/Molecules/RecentFlows",
  component: RecentFlows,
};

export default meta;

type Story = StoryObj<typeof RecentFlows>;

const mockFlows = [
  {
    team: "opensystemslab",
    flow: "property-types",
    href: "/opensystemslab/property-types",
  },
  {
    team: "opensystemslab",
    flow: "about-the-property",
    href: "/opensystemslab/about-the-property",
  },
  {
    team: "barnet",
    flow: "apply-for-prior-approval",
    href: "/barnet/apply-for-prior-approval",
  },
];

export const Basic = {
  render: () => <RecentFlows flows={mockFlows} />,
} satisfies Story;

export const SingleFlow = {
  render: () => <RecentFlows flows={[mockFlows[0]]} />,
} satisfies Story;
