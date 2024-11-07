import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RuleIcon from "@mui/icons-material/Rule";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { format } from "date-fns";
import { client } from "lib/graphql";
import React, { useState } from "react";
import { Feedback } from "routes/feedback";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { GET_FEEDBACK_BY_ID_QUERY } from "../queries/getFeedbackById";
import { DetailedFeedback, StyledSummaryListTable } from "../styled";

interface CollapsibleRowProps extends Feedback {
  displayFeedbackItems: string[];
}

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

type FeedbackType =
  | "issue"
  | "idea"
  | "comment"
  | "inaccuracy"
  | "helpful"
  | "unhelpful";

const feedbackTypeIcon = (type: FeedbackType) => {
  switch (type) {
    case "issue":
      return { icon: <WarningIcon />, title: "Issue" };
    case "idea":
      return { icon: <LightbulbIcon />, title: "Idea" };
    case "comment":
      return { icon: <MoreHorizIcon />, title: "Comment" };
    case "helpful":
      return {
        icon: <CheckCircleIcon color="success" />,
        title: "Helpful (help text)",
      };
    case "unhelpful":
      return {
        icon: <CancelIcon color="error" />,
        title: "Unhelpful (help text)",
      };
    default:
      return { icon: <RuleIcon />, title: "inaccuracy" };
  }
};

export const CollapsibleRow: React.FC<CollapsibleRowProps> = (item) => {
  const [open, setOpen] = useState<boolean>(false);
  const [detailedFeedback, setDetailedFeedback] = useState<
    Record<string, any> | undefined
  >(undefined);
  const { icon, title } = feedbackTypeIcon(item.type);

  const toggleDetailedFeedback = async () => {
    setOpen(!open);
    if (!open && !detailedFeedback) {
      const fetchedData = await getDetailedFeedback(item.id);
      setDetailedFeedback(fetchedData);
    }
  };

  const generateCommentSummary = (userComment: string | null) => {
    if (!userComment) return "No comment";

    const COMMENT_LENGTH = 50;
    const shouldBeSummarised = userComment.length > COMMENT_LENGTH;
    if (shouldBeSummarised) return `${userComment.slice(0, COMMENT_LENGTH)}...`;

    return userComment;
  };

  const commentSummary = generateCommentSummary(item.userComment);

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
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon} {title}
          </Box>
        </TableCell>
        <TableCell>
          {format(new Date(item.createdAt), "dd/MM/yy hh:mm:ss")}
        </TableCell>
        <TableCell>{commentSummary}</TableCell>
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
        <TableCell sx={{ padding: 0, border: "none" }} colSpan={4}>
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
