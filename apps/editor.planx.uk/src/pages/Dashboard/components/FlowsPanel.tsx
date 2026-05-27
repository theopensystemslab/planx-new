import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import StyledTab from "ui/editor/StyledTab";

import { useStore } from "../../FlowEditor/lib/store";
import { useGetFlows } from "../../Team/components/hooks/useGetFlows";

type Tab = "recent" | "pinned";

const MAX_FLOWS = 5;

export const FlowsPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>("recent");
  const teamId = useStore((state) => state.getTeam().id);
  const { data } = useGetFlows(teamId);

  const flows = data?.flows ?? [];

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
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        sx={{ minHeight: 0, borderBottom: 1, borderColor: "border.main" }}
      >
        <StyledTab label="Recent flows" value="recent" fontSize="16px" />
        <StyledTab label="Pinned flows" value="pinned" fontSize="16px" />
      </Tabs>
      <List disablePadding sx={{ overflowY: "auto", flex: 1 }}>
        {displayed.map((flow, i) => {
          const isOnline = flow.status === "online";
          const isAnyTemplate = flow.isTemplate || Boolean(flow.templatedFrom);
          return (
            <React.Fragment key={flow.id}>
              {i > 0 && <Divider />}
              <ListItem
                sx={{
                  px: 1.5,
                  py: 1,
                  backgroundColor: isAnyTemplate
                    ? "template.light"
                    : "transparent",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {flow.name}
                    </Typography>
                  }
                />
                <FlowTag
                  tagType={FlowTagType.Status}
                  statusVariant={
                    isOnline ? StatusVariant.Online : StatusVariant.Offline
                  }
                >
                  {isOnline ? "Online" : "Offline"}
                </FlowTag>
              </ListItem>
            </React.Fragment>
          );
        })}
        {displayed.length === 0 && (
          <ListItem sx={{ px: 1.5, py: 1 }}>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {tab === "pinned" ? "No pinned flows" : "No flows yet"}
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </>
  );
};
