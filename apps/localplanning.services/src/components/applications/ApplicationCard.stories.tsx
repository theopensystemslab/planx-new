import type { Meta, StoryObj } from "@storybook/react";

import {
  mockAwaitingPayment,
  mockDraft,
  mockSubmitted,
} from "../../../.storybook/mocks/handlers";
import { ApplicationCard } from "./ApplicationCard";

const meta: Meta = {
  title: "Molecules/ApplicationCard",
  component: ApplicationCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <ul className="max-w-2xl">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

export const Draft: StoryObj = {
  render: () => <ApplicationCard {...mockDraft} />,
};

export const AwaitingPayment: StoryObj = {
  render: () => <ApplicationCard {...mockAwaitingPayment} />,
};

export const Submitted: StoryObj = {
  render: () => <ApplicationCard {...mockSubmitted} />,
};

export const NoAddress: StoryObj = {
  render: () => (
    <ApplicationCard {...mockDraft} id="draft-no-address" address={null} />
  ),
};
