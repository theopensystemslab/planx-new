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
  const getResponse = ({ eventType, status, response }: Submission) => {
    if (eventType === "Pay") return response;
    if (status === "Success") return response?.data?.body;

    return response.data;
  }

  const response = getResponse(submission);
  const formattedResponse = JSON.stringify(response, null, 2);

  return (
    <Response component="pre">
      {formattedResponse}
    </Response>
  );
};
