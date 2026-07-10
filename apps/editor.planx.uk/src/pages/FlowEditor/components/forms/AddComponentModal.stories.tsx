import Paper from "@mui/material/Paper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import React, { useState } from "react";

import AddComponentModal, {
  AddComponentModalContent,
  type ModalTab,
} from "./AddComponentModal";

const meta: Meta<typeof AddComponentModal> = {
  title: "Editor Components/Modal/AddComponentModal",
  component: AddComponentModal,
};

export default meta;

type Story = StoryObj<typeof AddComponentModal>;

const AddComponentModalContentDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModalTab>("components");

  return (
    <Paper
      sx={{
        width: activeTab === "patterns" ? 560 : 300,
        maxHeight: "min(480px, 85vh)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
      }}
    >
      <AddComponentModalContent
        onSelect={() => {}}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Paper>
  );
};

export const Default: Story = {
  render: () => <AddComponentModalContentDemo />,
};
