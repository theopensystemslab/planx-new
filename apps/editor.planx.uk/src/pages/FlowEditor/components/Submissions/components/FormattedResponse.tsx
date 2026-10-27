import ReactJson from "@microlink/react-json-view";
import { styled } from "@mui/material/styles";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";

const Root = styled("pre")(({ theme }) => ({
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
  hideRootName?: boolean;
}

export const FormattedResponse: React.FC<FormattedResponseProps> = ({
  response,
  expandAllLevels,
  hideRootName,
}) => {
  let parsedResponse;
  try {
    parsedResponse =
      typeof response === "string" ? JSON.parse(response) : (response ?? {});
  } catch (error) {
    parsedResponse = { error: "Invalid JSON format", raw: response };
  }

  return (
    <Root>
      <AppErrorBoundary FallbackComponent={InvalidJSONError} disableReporting>
        <ReactJson
          src={parsedResponse}
          name={hideRootName ? false : undefined}
          theme="monokai"
          collapsed={expandAllLevels ? false : 2}
          displayDataTypes={false}
          indentWidth={2}
          style={{ background: "transparent" }}
          enableClipboard={false}
        />
      </AppErrorBoundary>
    </Root>
  );
};
