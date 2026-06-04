import { Meta } from "@storybook/tanstack-react";

import SaveAndReturn, { ConfirmEmail } from "./SaveAndReturn";

const meta = {
  title: "Design System/Pages/StartApplication",
  component: SaveAndReturn,
  parameters: {
    // ConfirmEmail renders its own <main> via the shared Main component,
    // so the global decorator should not add a second one.
    noMainWrapper: true,
  },
} satisfies Meta<typeof SaveAndReturn>;

export default meta;

export const Basic = {
  render: () => <ConfirmEmail handleSubmit={() => console.log("")} />,
};
