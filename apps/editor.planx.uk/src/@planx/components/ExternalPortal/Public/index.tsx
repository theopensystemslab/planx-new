import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import Typography from "@mui/material/Typography";
import type { PublicProps } from "@planx/components/shared/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { isEmpty } from "lodash";

import Card from "../../shared/Preview/Card";
import { WarningContainer } from "../../shared/Preview/WarningContainer";
import { ExternalPortal } from "./../model";
import { useNestedFlowData } from "./hooks/useNestedFlowData";

export type Props = PublicProps<ExternalPortal>;

export default function Component(props: Props) {
  const nestedFlowData = useNestedFlowData(props.flowId);
  const isLoading = isEmpty(nestedFlowData);

  if (isLoading) {
    return <DelayedLoadingIndicator text="Fetching nested flow data..." />;
  }

  // Can this be something like `<Questions />` instead, but passing in flow data as prop instead of reading from store ??
  return (
    <Card handleSubmit={props.handleSubmit}>
      <WarningContainer>
        <ErrorOutline />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {`This is a nested flow placeholder (flowId: ${props.flowId}).`}
          <br />
          <br />
          To view nested flow content, please use a Preview or Published route.
        </Typography>
      </WarningContainer>
    </Card>
  );
}
