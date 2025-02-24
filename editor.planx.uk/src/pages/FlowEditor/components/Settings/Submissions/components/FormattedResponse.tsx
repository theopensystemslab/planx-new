import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

import { Submission } from "../types";

const Response = styled(Box)(() => ({
  fontSize: "1em",
  margin: 1,
  maxWidth: "contentWrap",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
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
