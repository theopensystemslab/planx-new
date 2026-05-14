import type { Preview, Decorator } from "@storybook/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import { $session } from "../src/stores/session";
import { queryClient } from "../src/lib/queryClient";
import "../src/styles/global.css";

// Initialise MSW to intercept network requests before any story renders
initialize();

/**
 * Provides the singleton queryClient in context and clears it between stories
 */
const withQueryClient: Decorator = (Story) => {
  queryClient.clear();
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

/**
 * Seeds the $session nanostore so hooks that require authentication
 * (useDeleteApplication, useFetchApplications) find a valid session
 */
const withSession: Decorator = (Story) => {
  $session.set({ token: "mock-token", email: "test@example.com" });
  return <Story />;
};

const preview: Preview = {
  decorators: [withQueryClient, withSession],
  loaders: [mswLoader],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    layout: "padded",
    options: {
      storySort: {
        order: ["Atoms", "Molecules", "Organisms"],
      },
    },
  },
};

export default preview;
