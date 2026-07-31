import Paper from "@mui/material/Paper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import AddComponentModal from ".";
import { componentListFrameSx, ComponentsTab } from "./ComponentsTab";

const meta: Meta<typeof AddComponentModal> = {
  title: "Editor Components/Modal/AddComponentModal",
  component: AddComponentModal,
};

export default meta;

type Story = StoryObj<typeof AddComponentModal>;

export const Default: Story = {
  render: () => (
    <Paper sx={componentListFrameSx}>
      <ComponentsTab onSelect={() => {}} />
    </Paper>
  ),
};
