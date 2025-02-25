import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { client } from "lib/graphql";
import React, { useState } from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { GET_FEEDBACK_BY_ID_QUERY } from "../queries/getFeedbackById";
import { DetailedFeedback, StyledSummaryListTable } from "../styled";
import { CollapsibleRowProps } from "../types";

const getDetailedFeedback = async (feedbackId: number) => {
  const {
    data: {
      feedback: [detailedFeedback],
    },
  } = await client.query({
    query: GET_FEEDBACK_BY_ID_QUERY,
    variables: { feedbackId },
  });

  const combinedHelpText = [
    detailedFeedback.helpText,
    detailedFeedback.helpDefinition,
    detailedFeedback.helpSources,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const truncatedHelpText =
    combinedHelpText.length > 65
      ? `${combinedHelpText.slice(0, 65)}...`
      : combinedHelpText;

  return {
    combinedHelp: truncatedHelpText,
    ...detailedFeedback,
    where: `${detailedFeedback.nodeType} — ${detailedFeedback.nodeTitle}`,
    browserPlatform: `${detailedFeedback.browser} / ${detailedFeedback.platform}`,
  };
};

export const CollapsibleRow: React.FC<CollapsibleRowProps> = (item) => {
  const [open, setOpen] = useState<boolean>(false);
  const [detailedFeedback, setDetailedFeedback] = useState<
    Record<string, any> | undefined
  >(undefined);

  const toggleDetailedFeedback = async () => {
    setOpen(!open);
    if (!open && !detailedFeedback) {
      const fetchedData = await getDetailedFeedback(item.id);
      setDetailedFeedback(fetchedData);
    }
  };

  const filteredFeedbackItems = (() => {
    switch (item.type) {
      case "issue":
        return ["userContext", ...item.displayFeedbackItems];
      case "helpful":
      case "unhelpful":
        return ["combinedHelp", ...item.displayFeedbackItems];
      default:
        return item.displayFeedbackItems;
    }
  })();

  const labelMap: Record<string, string> = {
    userComment: item.type === "issue" ? "What went wrong?" : "User comment",
    address: "Property address",
    flowName: "Service",
    projectType: "Project type",
    where: "Where",
    browserPlatform: "Browser / device",
    combinedHelp: "Help text (more information)",
    userContext: "What were you doing?",
  };

  const renderContent = (key: string, value: any) => {
    if (key === "combinedHelp" && value) {
      return <ReactMarkdownOrHtml source={value} openLinksOnNewTab />;
    }
    return <span>{String(value)}</span>;
  };

  return (
    <React.Fragment>
      <TableRow key={item.id}>
        <TableCell sx={{ textAlign: "right" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={toggleDetailedFeedback}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={{ background: (theme) => theme.palette.background.paper }}>
        <TableCell sx={{ padding: 0, border: "none" }} colSpan={6}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{
              borderBottom: (theme) =>
                `1px solid ${theme.palette.border.light}`,
              padding: (theme) => theme.spacing(0, 1.5),
            }}
          >
            <DetailedFeedback>
              <StyledSummaryListTable sx={{ margin: "0", rowGap: "5px" }}>
                {detailedFeedback &&
                  filteredFeedbackItems
                    .filter((key) => detailedFeedback[key] !== null)
                    .map((key, index) => (
                      <React.Fragment key={index}>
                        <Box component="dt">{labelMap[key]}</Box>
                        <Box component="dd">
                          {renderContent(key, detailedFeedback[key])}
                        </Box>
                      </React.Fragment>
                    ))}
              </StyledSummaryListTable>
            </DetailedFeedback>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
