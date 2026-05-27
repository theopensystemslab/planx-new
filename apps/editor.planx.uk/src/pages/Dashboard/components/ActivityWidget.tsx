import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import { useActivityData } from "hooks/data/useActivityData";
import React, { useState } from "react";
import StyledTab from "ui/editor/StyledTab";

import ServiceListWithCount from "./ServiceListWithCount";

const Content = styled(Box)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  justifyContent: "flex-end",
  overflow: "hidden",
});

export default function ActivityWidget() {
  const [tab, setTab] = useState(0);
  const { sessions, submissions } = useActivityData();

  return (
    <Content>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        sx={{
          minHeight: 36,
          borderBottom: 1,
          borderColor: "divider",
          [`& .${tabsClasses.indicator}`]: { display: "none" },
        }}
      >
        <StyledTab label="Sessions by service" />
        <StyledTab label="Submissions by service" />
      </Tabs>
      {tab === 0 && <ServiceListWithCount items={sessions} />}
      {tab === 1 && <ServiceListWithCount items={submissions} />}
    </Content>
  );
}
