import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { ActivityItem } from "hooks/data/useActivityData";
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

const LoadingArea = styled(Box)({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

interface ActivityWidgetProps {
  sessions: ActivityItem[];
  submissions: ActivityItem[];
  loading: boolean;
}

export function ActivityWidget({
  sessions,
  submissions,
  loading,
}: ActivityWidgetProps) {
  const [tab, setTab] = useState(0);

  return (
    <Content>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        sx={{
          minHeight: 36,
          borderBottom: 1,
          paddingX: 1.25,
          borderColor: "divider",
          [`& .${tabsClasses.indicator}`]: { display: "none" },
        }}
      >
        <StyledTab label="Sessions by service" />
        <StyledTab label="Submissions by service" />
      </Tabs>
      {loading ? (
        <LoadingArea>
          <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
        </LoadingArea>
      ) : (
        <>
          {tab === 0 && <ServiceListWithCount items={sessions} />}
          {tab === 1 && <ServiceListWithCount items={submissions} />}
        </>
      )}
    </Content>
  );
}

export default function ConnectedActivityWidget() {
  const { sessions, submissions, loading } = useActivityData();
  return (
    <ActivityWidget
      sessions={sessions}
      submissions={submissions}
      loading={loading}
    />
  );
}
