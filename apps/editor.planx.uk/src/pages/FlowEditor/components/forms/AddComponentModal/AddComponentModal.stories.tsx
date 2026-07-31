import Paper from "@mui/material/Paper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { graphql, HttpResponse } from "msw";
import React, { useState } from "react";

import { COMPONENT_LIST_WIDTH, componentListFrameSx } from "./ComponentsTab";
import type { ModalTab } from "./ModalTabs";
import { ModalTabs } from "./ModalTabs";
import { mockPatternData, mockPatterns } from "./PatternsTab/mocks";
import { DETAIL_PANEL_WIDTH } from "./PatternsTab/PatternDetailPanel";

/**
 * Stories render the modal's tabbed content rather than the full `AddComponentModal`,
 * which additionally needs a popover anchor and a router context
 */
const meta: Meta<typeof ModalTabs> = {
  title: "Editor Components/Modal/AddComponentModal",
  component: ModalTabs,
  parameters: {
    msw: {
      handlers: [
        graphql.query("GetPatterns", () =>
          HttpResponse.json({ data: { patterns: mockPatterns } }),
        ),
        graphql.query("GetPatternData", ({ variables }) =>
          HttpResponse.json({
            data: {
              pattern: { id: variables.id, data: mockPatternData },
            },
          }),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ModalTabs>;

/**
 * Stands in for the popover, which owns the tab state and sizes itself to the tab
 *
 */
const ModalTabsWrapper: React.FC<{ initialTab: ModalTab }> = ({
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab);

  return (
    <Paper
      sx={{
        ...componentListFrameSx,
        width:
          activeTab === "patterns"
            ? COMPONENT_LIST_WIDTH + DETAIL_PANEL_WIDTH
            : COMPONENT_LIST_WIDTH,
      }}
    >
      <ModalTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onComponentSelect={() => {}}
        onInsertPattern={() => {}}
      />
    </Paper>
  );
};

export const Default: Story = {
  render: () => <ModalTabsWrapper initialTab="components" />,
};

export const Patterns: Story = {
  render: () => <ModalTabsWrapper initialTab="patterns" />,
};
