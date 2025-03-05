import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Submission } from "../types";

const Root = styled(Box)(({ theme }) => ({
  fontSize: "1em",
  margin: 1,
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  textAlign: "start",
  backgroundColor: theme.palette.background.paper,
}));

const InvalidJSONError = () => "Error parsing response";

const Response: React.FC<{ response: string }> = ({ response }) => {
  const parsedResponse = JSON.parse(response);
  return JSON.stringify(parsedResponse, null, 2);
};

export const FormattedResponse: React.FC<Submission> = (submission) => {
  const getResponse = ({ eventType, status, response }: Submission) => {
    if (eventType === "Pay") return response;
    if (status === "Success") return response?.data?.body;

    return response.data?.message;
  };

  const response = getResponse(submission);

  return (
    <Root component="pre">
      <ErrorBoundary FallbackComponent={InvalidJSONError}>
        <Response response={response} />
      </ErrorBoundary>
    </Root>
  );
};
