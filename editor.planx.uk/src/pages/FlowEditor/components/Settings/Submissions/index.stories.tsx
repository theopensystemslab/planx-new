import { MockedProvider } from "@apollo/client/testing";
import { Meta, StoryObj } from "@storybook/react";
import { vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Submissions from "./index";
import { mockRequests } from "./mocks";

const { setState } = vanillaStore;
setState({ flowSlug: "test-service", teamSlug: "test-team" });

const meta: Meta<typeof Submissions> = {
  title: "Design System/Molecules/Submissions",
  component: Submissions,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const DefaultView: Story = {
  render: () => (
    <MockedProvider mocks={[mockRequests[0]]} addTypename={false}>
      <Submissions />
    </MockedProvider>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <MockedProvider
      mocks={[{ ...mockRequests[0], delay: 2000 }]}
      addTypename={false}
    >
      <Submissions />
    </MockedProvider>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <MockedProvider
      mocks={[{ ...mockRequests[0], error: new Error("An error occurred") }]}
      addTypename={false}
    >
      <Submissions />
    </MockedProvider>
  ),
};

export const NoResults: Story = {
  render: () => (
    <MockedProvider
      mocks={[
        {
          ...mockRequests[0],
          result: {
            data: {
              submissionServicesSummary: [],
            },
          },
        },
      ]}
      addTypename={false}
    >
      <Submissions />
    </MockedProvider>
  ),
};
