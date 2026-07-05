import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import StyledTab from "ui/editor/StyledTab";

import type { FlowView } from "./index";

const tabs = [
  { label: "Flows", path: "flows" },
  { label: "Archive", path: "archive" },
];

interface Props {
  flowView: "flows" | "archive";
  setFlowView: Dispatch<SetStateAction<FlowView>>;
}

const TabList = styled(Box)(() => ({
  position: "relative",
  marginLeft: "-12px",
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
})); // TODO: a lot of this is copied from SettingsLayout, is there a better pattern for reusing them?

const TeamLayout: React.FC<Props> = ({ flowView, setFlowView }) => {
  const handleChange = () => {
    flowView === "flows" ? setFlowView("archive") : setFlowView("flows");
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "border.main",
      }}
    >
      <TabList>
        <Tabs onChange={handleChange} value={flowView} aria-label={"Flows"}>
          {tabs.map(({ label, path }) => (
            <StyledTab size="large" key={path} value={path} label={label} />
          ))}
        </Tabs>
      </TabList>
    </Box>
  );
};

export default TeamLayout;
