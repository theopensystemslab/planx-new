import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";
import { Dispatch, SetStateAction } from "react";
import StyledTab from "ui/editor/StyledTab";

import { FlowView } from "./index"

const tabs = [
  { label: "Flows", path: "flows" },
  { label: "Archive", path: "archive" },
];

interface Props {
  flowView: "flows" | "archive";
  setFlowView: Dispatch<SetStateAction<FlowView>>;
  children: ReactNode;
}

const TabList = styled(Box)(() => ({
  position: "relative",
  marginLeft: "-12px",
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
})); // TODO: a lot of this is copied from SettingsLayout, is there a better pattern for reusing them?

const TeamLayout: React.FC<Props> = ({
  flowView,
  setFlowView,
  children
}) => {

  const handleChange = () => {
    flowView === "flows" ? setFlowView("archive") : setFlowView("flows")
  };

  return (
    <Box width="100%" bgcolor="background.paper">
        <Box
            pb={1}
            sx={{
            display: "flex",
            flexDirection: { xs: "column", contentWrap: "row" },
            alignItems: { xs: "flex-start", contentWrap: "center" },
            gap: 2,
            }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Flows
          </Typography>
            {children}
          </Box>
          <TabList>
            <Tabs onChange={handleChange} value={flowView} aria-label={"Flows"}>
              {tabs.map(({ label, path }) => (
                <StyledTab
                  size="large"
                  key={path}
                  value={path}
                  label={label}
                />
              ))}
            </Tabs>
          </TabList>
      </Box>
  );
};

export default TeamLayout;
