import Paper from "@mui/material/Paper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import AddComponentModal, {
  AddComponentModalContent,
} from "./AddComponentModal";

const meta: Meta<typeof AddComponentModal> = {
  title: "Editor Components/Modal/AddComponentModal",
  component: AddComponentModal,
};

export default meta;

type Story = StoryObj<typeof AddComponentModal>;

export const Default: Story = {
  render: () => (
    <Paper
      sx={{
        width: 300,
        maxHeight: "min(480px, 85vh)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
      }}
    >
      <AddComponentModalContent onSelect={() => {}} />
    </Paper>
  ),
};
