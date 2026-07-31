import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import React from "react";
import StyledTab from "ui/editor/StyledTab";

import { COMPONENT_LIST_WIDTH, ComponentsTab } from "./ComponentsTab";
import { PatternsTab } from "./PatternsTab";

export type ModalTab = "components" | "patterns";

const TabList = styled(Box)(({ theme }) => ({
  position: "relative",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  width: "100%",
  [`& .${tabsClasses.root}`]: {
    minHeight: 0,
    padding: theme.spacing(0, 1),
  },
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

interface Props {
  activeTab: ModalTab;
  onTabChange: (tab: ModalTab) => void;
  onComponentSelect: (slug: string) => void;
  onInsertPattern: (patternId: string) => void;
}

/**
 * Tabbed content of the AddComponentModal
 *
 * Kept free of the Popover and router wiring which live in the parent, so that this
 * can be rendered standalone (e.g. in Storybook)
 */
export const ModalTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onComponentSelect,
  onInsertPattern,
}) => {
  return (
    <>
      <TabList>
        <Box sx={{ maxWidth: COMPONENT_LIST_WIDTH }}>
          <Tabs
            value={activeTab}
            onChange={(_event, value: ModalTab) => onTabChange(value)}
            aria-label="Modal tabs"
            variant="fullWidth"
          >
            <StyledTab value="components" label="Components" />
            <StyledTab value="patterns" label="Patterns" />
          </Tabs>
        </Box>
      </TabList>
      {activeTab === "components" && (
        <ComponentsTab onSelect={onComponentSelect} />
      )}
      {activeTab === "patterns" && <PatternsTab onInsert={onInsertPattern} />}
    </>
  );
};
