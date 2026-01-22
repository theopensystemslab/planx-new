import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Close from "@mui/icons-material/Close";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import TurnSharpLeftIcon from "@mui/icons-material/TurnSharpLeft";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

export interface RecentFlow {
  team: string;
  flow: string;
  href: string;
}

export interface RecentFlowsProps {
  flows: RecentFlow[];
}

const RECENT_ROW_HEIGHT = "32px";

const RecentFlowContainer = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "stretch",
  backgroundColor: "#1a1a1a",
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.75, 1),
  maxWidth: "100%",
  "& svg": {
    color: theme.palette.secondary.dark,
  },
}));

const RecentFlowList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(0.25),
}));

const RecentFlowItem = styled(Box)<{ indent?: number }>(
  ({ indent = 0, theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.25),
    whiteSpace: "nowrap",
    paddingLeft: indent * 20,
    color: "#ffffff",
    height: RECENT_ROW_HEIGHT,
  }),
);

const RecentFlowLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  display: "flex",
  alignItems: "center",
  flexWrap: "nowrap",
  gap: theme.spacing(0.5),
  textDecoration: "none",
  "& span": {
    textDecoration: "underline",
  },
  "&:hover span": {
    textDecorationWeight: "4px",
  },
}));

const ToggleWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  minHeight: RECENT_ROW_HEIGHT,
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  marginLeft: theme.spacing(0.5),
  padding: theme.spacing(0.4, 0.25, 0.4, 1),
  borderLeft: `1px solid ${theme.palette.border.main}`,
  alignSelf: "stretch",
  alignItems: "flex-start",
}));

const RecentFlows: React.FC<RecentFlowsProps> = ({ flows }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const visibleFlows = isExpanded ? flows : flows.slice(0, 1);

  return (
    <RecentFlowContainer>
      <RecentFlowList>
        {visibleFlows.map((flow, index) => (
          <RecentFlowItem
            key={`${flow.team}-${flow.flow}-${index}`}
            indent={index}
          >
            <TurnSharpLeftIcon fontSize="small" color="inherit" />
            <RecentFlowLink variant="body3" href={flow.href}>
              {flow.team}
              <ChevronRightIcon fontSize="small" />
              <span>{flow.flow}</span>
            </RecentFlowLink>
          </RecentFlowItem>
        ))}
      </RecentFlowList>
      {flows.length > 1 && (
        <ToggleWrap>
          <ToggleButton
            onClick={handleToggle}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? "Collapse recent flows"
                : `Expand recent flows (${flows.length - 1} more)`
            }
          >
            {isExpanded ? (
              <Close fontSize="small" />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body3">+{flows.length - 1}</Typography>
                <KeyboardArrowDown />
              </Box>
            )}
          </ToggleButton>
        </ToggleWrap>
      )}
    </RecentFlowContainer>
  );
};

export default RecentFlows;
