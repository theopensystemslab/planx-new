import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import React, { useState } from "react";
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
  onComponentSelect: (slug: string) => void;
  onPatternSelect: (patternId: string) => void;
}

/**
 * Tabbed content of the AddComponentModal
 *
 * Kept free of the Popover and router wiring which live in the parent, so that this
 * can be rendered standalone (e.g. in Storybook)
 */
export const ModalTabs: React.FC<Props> = ({
  onComponentSelect,
  onPatternSelect,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>("components");

  return (
    <>
      <TabList>
        <Box sx={{ maxWidth: COMPONENT_LIST_WIDTH }}>
          <Tabs
            value={activeTab}
            onChange={(_event, value: ModalTab) => setActiveTab(value)}
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
      {activeTab === "patterns" && <PatternsTab onSelect={onPatternSelect} />}
    </>
  );
};
