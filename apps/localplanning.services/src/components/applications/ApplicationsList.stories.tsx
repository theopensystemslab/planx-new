import type { Meta, StoryObj } from "@storybook/react";

import {
  emptyHandlers,
  errorConsumedLinkHandlers,
  errorExpiredLinkHandlers,
  errorInvalidLinkHandlers,
  handlers,
  loadingHandlers,
} from "../../../.storybook/mocks/handlers";
import { ApplicationsList } from "./ApplicationsList";

/**
 * ApplicationsList is the full post-login dashboard view
 * All network requests are mocked and intercepted by MSW
 */
const meta = {
  title: "Organisms/ApplicationsList",
  component: ApplicationsList,
  parameters: {
    layout: "padded",
    // Default - a full mixed list of applications
    msw: { handlers },
  },
} satisfies Meta<typeof ApplicationsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithApplications: Story = {
  name: "With applications (all statuses)",
};

export const Empty: Story = {
  name: "No applications",
  parameters: {
    msw: { handlers: emptyHandlers },
  },
};

export const Loading: Story = {
  name: "Loading state",
  parameters: {
    msw: { handlers: loadingHandlers },
  },
};

export const ErrorInvalidLink: Story = {
  name: "Error - invalid link",
  parameters: {
    msw: { handlers: errorInvalidLinkHandlers },
  },
};

export const ErrorExpiredLink: Story = {
  name: "Error - expired link",
  parameters: {
    msw: { handlers: errorExpiredLinkHandlers },
  },
};

export const ErrorConsumedLink: Story = {
  name: "Error - link already used",
  parameters: {
    msw: { handlers: errorConsumedLinkHandlers },
  },
};
