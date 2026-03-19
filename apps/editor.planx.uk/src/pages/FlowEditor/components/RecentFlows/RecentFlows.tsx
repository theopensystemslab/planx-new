import Close from "@mui/icons-material/Close";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouterState } from "@tanstack/react-router";
import React, { useState } from "react";

import { RecentFlowLink } from "./RecentFlowLink";
import {
  ExpandableContent,
  RecentFlowContainer,
  RecentFlowItem,
  RecentFlowList,
  RecentFlowsOverlay,
  ToggleButton,
  ToggleWrap,
} from "./styles";

const RecentFlows = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => setIsExpanded((prev) => !prev);

  const recentFlows = useRouterState({
    select: (s) => s.location.state?.recentFlows || [],
  });

  // Collapsed: show the directly previous (most recent) flow
  // Expanded: show the original flow at top, then in oldest → newest order
  const firstFlow = isExpanded
    ? recentFlows[0]
    : recentFlows[recentFlows.length - 1];
  const additionalFlows = recentFlows.slice(1);

  if (!recentFlows.length) return null;

  return (
    <RecentFlowsOverlay>
      <RecentFlowContainer>
        <RecentFlowList>
          <RecentFlowItem indent={0}>
            <RecentFlowLink isFirst flow={firstFlow} />
          </RecentFlowItem>

          <ExpandableContent isExpanded={isExpanded}>
            <Box>
              {additionalFlows.map((flow, index) => (
                <RecentFlowItem key={`${flow.id}-${index}`} indent={index + 1}>
                  <RecentFlowLink flow={flow} />
                </RecentFlowItem>
              ))}
            </Box>
          </ExpandableContent>
        </RecentFlowList>

        {recentFlows.length > 1 && (
          <ToggleWrap>
            <ToggleButton
              onClick={handleToggle}
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? "Collapse recent flows"
                  : `Expand recent flows (${recentFlows.length - 1} more)`
              }
            >
              {isExpanded ? (
                <Close sx={{ pt: 0.25 }} />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body3">
                    +{recentFlows.length - 1}
                  </Typography>
                  <KeyboardArrowDown />
                </Box>
              )}
            </ToggleButton>
          </ToggleWrap>
        )}
      </RecentFlowContainer>
    </RecentFlowsOverlay>
  );
};

export default RecentFlows;
