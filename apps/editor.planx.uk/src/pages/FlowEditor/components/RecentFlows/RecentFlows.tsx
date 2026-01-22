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
  backgroundColor: theme.palette.text.primary,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.75, 0),
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
  paddingLeft: theme.spacing(0.25),
}));

const RecentFlowItem = styled(Box)<{ indent?: number }>(
  ({ indent = 0, theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    whiteSpace: "nowrap",
    marginLeft: indent * 8,
    padding: theme.spacing(0, 2, 0, 1),
    color: theme.palette.common.white,
    height: RECENT_ROW_HEIGHT,
  }),
);

const RecentFlowLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  display: "flex",
  alignItems: "center",
  flexWrap: "nowrap",
  gap: theme.spacing(0.15),
  textDecoration: "none",
  "& span": {
    textDecoration: "underline",
  },
  "&:hover span": {
    textDecorationThickness: "2px",
  },
}));

const ToggleWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  minHeight: RECENT_ROW_HEIGHT,
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(0.4, 1),
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
            <RecentFlowLink variant="body3" href={flow.href}>
              <TurnSharpLeftIcon sx={{ mr: 0.25 }} fontSize="small" />
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
              <Close sx={{ pt: 0.25 }} />
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
