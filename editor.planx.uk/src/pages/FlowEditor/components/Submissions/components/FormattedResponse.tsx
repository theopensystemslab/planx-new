import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

import { Submission } from "../types";

const Response = styled(Box)(({ theme }) => ({
  fontSize: "1em",
  margin: 1,
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  textAlign: "start",
  backgroundColor: theme.palette.background.paper,
}));

export const FormattedResponse: React.FC<Submission> = (submission) => {
  return submission.eventType === "Pay" ? (
    <Response component="pre">
      {JSON.stringify(submission.response, null, 2)}
    </Response>
  ) : (
    <Response component="pre">
      {submission.status === "Success"
        ? JSON.stringify(JSON.parse(submission.response?.data?.body), null, 2)
        : JSON.stringify(
            JSON.parse(submission.response?.data?.message),
            null,
            2,
          )}
    </Response>
  );
};
