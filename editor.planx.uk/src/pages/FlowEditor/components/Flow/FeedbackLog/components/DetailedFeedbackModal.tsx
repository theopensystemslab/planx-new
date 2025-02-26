import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import React from "react";
import { Feedback } from "routes/feedback";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { DetailedFeedback } from "../styled";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  feedback: Feedback;
  detailedFeedback?: Record<string, any>;
}

export const DetailedFeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
  feedback,
  detailedFeedback,
}) => {
  const displayFeedbackItems = [
    "userComment",
    "address",
    "projectType",
    "where",
    "browserPlatform",
  ];

  const { type } = feedback;

  const filteredFeedbackItems = (() => {
    switch (type) {
      case "issue":
        return ["userContext", ...displayFeedbackItems];
      case "helpful":
      case "unhelpful":
        return ["combinedHelp", ...displayFeedbackItems];
      default:
        return displayFeedbackItems;
    }
  })();

  const labelMap: Record<string, string> = {
    userComment: type === "issue" ? "What went wrong?" : "User comment",
    address: "Property address",
    flowName: "Service",
    projectType: "Project type",
    where: "Where",
    browserPlatform: "Browser / device",
    combinedHelp: "Help text (more information)",
    userContext: "What were you doing?",
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography
        variant="h3"
        sx={(theme) => ({ padding: theme.spacing(2, 3) })}
      >
        Detailed feedback
      </Typography>
      <DetailedFeedback>
        <SummaryListTable sx={{ margin: "0", rowGap: "5px" }}>
          {detailedFeedback &&
            filteredFeedbackItems
              .filter((key) => detailedFeedback[key] !== null)
              .map((key, index) => (
                <React.Fragment key={index}>
                  <Box component="dt">{labelMap[key]}</Box>
                  <Box component="dd">
                    {key === "combinedHelp" && detailedFeedback[key] ? (
                      <ReactMarkdownOrHtml
                        source={detailedFeedback[key]}
                        openLinksOnNewTab
                      />
                    ) : (
                      <span>{String(detailedFeedback[key])}</span>
                    )}
                  </Box>
                </React.Fragment>
              ))}
        </SummaryListTable>
      </DetailedFeedback>
    </Dialog>
  );
};
