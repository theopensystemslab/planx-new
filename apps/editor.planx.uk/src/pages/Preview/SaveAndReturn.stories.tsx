import { Meta } from "@storybook/react";
import React from "react";

import SaveAndReturn, { ConfirmEmail } from "./SaveAndReturn";

const meta = {
  title: "Design System/Pages/StartApplication",
  component: SaveAndReturn,
} satisfies Meta<typeof SaveAndReturn>;

export default meta;

export const Basic = {
  render: () => <ConfirmEmail handleSubmit={() => console.log("")} />,
};
