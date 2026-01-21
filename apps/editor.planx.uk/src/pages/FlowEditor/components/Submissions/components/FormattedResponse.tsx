import ReactJson from "@microlink/react-json-view";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const Root = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2),
  margin: 0,
  width: "100%",
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
  fontSize: theme.typography.body2.fontSize,
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
}));

const InvalidJSONError = () => "Error parsing response";

interface FormattedResponseProps {
  response: string | object | Record<string, unknown>;
  expandAllLevels?: boolean;
}

export const FormattedResponse: React.FC<FormattedResponseProps> = ({
  response,
  expandAllLevels,
}) => {
  let parsedResponse;
  try {
    parsedResponse =
      typeof response === "string" ? JSON.parse(response) : (response ?? {});
  } catch (error) {
    parsedResponse = { error: "Invalid JSON format", raw: response };
  }

  return (
    <Root component="pre">
      <ErrorBoundary FallbackComponent={InvalidJSONError}>
        <ReactJson
          src={parsedResponse}
          theme="monokai"
          collapsed={expandAllLevels ? false : 2}
          displayDataTypes={false}
          indentWidth={2}
          style={{ background: "transparent" }}
          enableClipboard={false}
        />
      </ErrorBoundary>
    </Root>
  );
};
