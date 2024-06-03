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
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { format } from "date-fns";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import React, { useState } from "react";
import { Feedback } from "routes/feedback";
import EditorRow from "ui/editor/EditorRow";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

interface Props {
  feedback: Feedback[];
}

const Feed = styled(TableContainer)(() => ({
  maxHeight: "60vh",
  overflow: "auto",
  display: "flex",
  flexDirection: "column-reverse",
  readingOrder: "flex-visual",
}));

const DetailedFeedback = styled(Box)(({ theme }) => ({
  fontSize: "1em",
  margin: 1,
  maxWidth: "100%",
  padding: theme.spacing(2, 1),
}));

const StyledSummaryListTable = styled(SummaryListTable)(() => ({
  "& p": {
    margin: 0,
  },
}));

const GET_FEEDBACK_BY_ID_QUERY = gql`
  query GetFeedbackById($feedbackId: Int!) {
    feedback: feedback_summary(where: { feedback_id: { _eq: $feedbackId } }) {
      address
      createdAt: created_at
      platform: device(path: "platform.type")
      browser: device(path: "browser.name")
      feedbackId: feedback_id
      type: feedback_type
      helpDefinition: help_definition
      helpSources: help_sources
      helpText: help_text
      intersectingConstraints: intersecting_constraints
      nodeData: node_data
      nodeId: node_id
      nodeText: node_text
      nodeTitle: node_title
      nodeType: node_type
      projectType: project_type
      serviceSlug: service_slug
      teamSlug: team_slug
      status
      uprn
      userComment: user_comment
      userContext: user_context
    }
  }
`;

const getDetailedFeedback = async (feedbackId: number) => {
  const {
    data: {
      feedback: [detailedFeedback],
    },
  } = await client.query({
    query: GET_FEEDBACK_BY_ID_QUERY,
    variables: { feedbackId },
  });

  const combinedHelpText = `${detailedFeedback.helpText || ""} ${
    detailedFeedback.helpDefinition || ""
  } ${detailedFeedback.helpSources || ""}`.trim();
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

export const FeedbackPage: React.FC<Props> = ({ feedback }) => {
  const displayFeedbackItems = [
    "userComment",
    "address",
    "projectType",
    "where",
    "browserPlatform",
  ];

  return (
    <Container maxWidth="contentWrap">
      <Box py={4}>
        <EditorRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Feedback log
          </Typography>
          <Typography variant="body1">
            Feedback from users about this service.
          </Typography>
        </EditorRow>
        <EditorRow>
          <Feed>
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow
                  sx={{ "& > *": { borderBottomColor: "black !important" } }}
                >
                  <TableCell sx={{ width: 160 }}>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell sx={{ width: 340 }}>
                    <strong>Comment</strong>
                  </TableCell>
                  <TableCell sx={{ width: 60 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedback.map((item) => (
                  <CollapsibleRow
                    key={item.id}
                    {...item}
                    displayFeedbackItems={displayFeedbackItems}
                  />
                ))}
              </TableBody>
            </Table>
          </Feed>
        </EditorRow>
      </Box>
    </Container>
  );
};

interface CollapsibleRowProps extends Feedback {
  displayFeedbackItems: string[];
}

const CollapsibleRow: React.FC<CollapsibleRowProps> = (item) => {
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

  const commentSummary = item.userComment
    ? item.userComment.length > 50
      ? `${item.userComment.slice(0, 50)}...`
      : item.userComment
    : "No comment";

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
    address: "Project address",
    projectType: "Project type",
    where: "Where",
    browserPlatform: "Browser / platform",
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
