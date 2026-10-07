import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { WarningContainer } from "./WarningContainer";

const meta = {
  title: "Design System/Molecules/WarningContainer",
  component: WarningContainer,
  argTypes: {
    icon: { control: false },
    children: { control: "text" },
  },
} satisfies Meta<typeof WarningContainer>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    children: "This is a warning message.",
  },
} satisfies Story;

export const WithIcon = {
  args: {
    icon: ErrorOutlineOutlined,
    children: "This is a warning message with an icon.",
  },
} satisfies Story;
