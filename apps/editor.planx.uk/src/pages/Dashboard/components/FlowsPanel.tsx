import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { Link } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import { EmptyState } from "ui/editor/EmptyState";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import StyledTab from "ui/editor/StyledTab";

import { useStore } from "../../FlowEditor/lib/store";
import { useGetFlows } from "../../Team/components/hooks/useGetFlows";
import { NoFlowsGetStarted } from "../../Team/index";

const TabList = styled(Box)(() => ({
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

const MAX_FLOWS = 5;

interface FlowsPanelProps {
  flows: FlowSummary[];
  teamSlug: string;
  loading?: boolean;
}

export const FlowsPanel: React.FC<FlowsPanelProps> = ({
  flows,
  teamSlug,
  loading = false,
}) => {
  const tab = useStore((state) => state.dashboardFlowsTab);
  const setTab = useStore((state) => state.setDashboardFlowsTab);

  const recentFlows = [...flows]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, MAX_FLOWS);

  const pinnedFlows = flows.filter((f) => f.pinnedFlows.length > 0);

  const displayed = tab === "recent" ? recentFlows : pinnedFlows;

  return (
    <>
      <TabList>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          sx={{
            minHeight: 0,
            borderBottom: 1,
            borderColor: "border.main",
            paddingX: 1.25,
          }}
        >
          <StyledTab label="Recent flows" value="recent" />
          <StyledTab label="Pinned flows" value="pinned" />
        </Tabs>
      </TabList>
      {loading ? (
        <List
          disablePadding
          sx={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
        </List>
      ) : (
        <List
          disablePadding
          sx={{
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {displayed.map((flow, i) => {
            const isOnline = flow.status === "online";
            const isService = flow.isService;
            const isAnyTemplate =
              flow.isTemplate || Boolean(flow.templatedFrom);
            return (
              <React.Fragment key={flow.id}>
                {i > 0 && <Divider sx={{ borderColor: "border.main" }} />}
                <ListItem
                  sx={{
                    position: "relative",
                    px: 2,
                    py: 1.25,
                    backgroundColor: isAnyTemplate
                      ? "template.light"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isAnyTemplate
                        ? "template.main"
                        : "background.paper",
                    },
                  }}
                >
                  <Link
                    to="/app/$team/$flow"
                    params={{ team: teamSlug, flow: flow.slug }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 1,
                    }}
                    aria-label={flow.name}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {flow.name}
                      </Typography>
                    }
                  />
                  {isService && (
                    <FlowTag
                      tagType={FlowTagType.Status}
                      statusVariant={
                        isOnline ? StatusVariant.Online : StatusVariant.Offline
                      }
                    >
                      {isOnline ? "Online" : "Offline"}
                    </FlowTag>
                  )}
                </ListItem>
                {i === displayed.length - 1 && (
                  <Divider sx={{ borderColor: "border.main" }} />
                )}
              </React.Fragment>
            );
          })}
          {displayed.length === 0 && (
            <ListItem
              sx={{
                display: "block",
                alignItems: "flex-start",
              }}
            >
              {tab === "pinned" ? (
                <EmptyState
                  size="small"
                  icon={<PushPinOutlinedIcon />}
                  title="No pinned flows"
                  description="Use the pin icon on a flow to add it here"
                />
              ) : (
                <NoFlowsGetStarted size="small" />
              )}
            </ListItem>
          )}
        </List>
      )}
    </>
  );
};

export default function ConnectedFlowsPanel() {
  const team = useStore((state) => state.getTeam());
  const { data, loading } = useGetFlows(team.id);
  const flows = data?.flows ?? [];

  return <FlowsPanel flows={flows} teamSlug={team.slug} loading={loading} />;
}
