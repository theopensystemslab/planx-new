import Paper from "@mui/material/Paper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { componentListFrameSx } from "./ComponentsTab";
import { ModalTabs } from "./ModalTabs";

/**
 * Stories render the modal's tabbed content rather than the full `AddComponentModal`,
 * which additionally needs a popover anchor and a router context
 */
const meta: Meta<typeof ModalTabs> = {
  title: "Editor Components/Modal/AddComponentModal",
  component: ModalTabs,
};

export default meta;

type Story = StoryObj<typeof ModalTabs>;

export const Default: Story = {
  render: () => (
    <Paper sx={componentListFrameSx}>
      <ModalTabs onComponentSelect={() => {}} onPatternSelect={() => {}} />
    </Paper>
  ),
};
