import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import Typography from "@mui/material/Typography";
import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";

import Card from "../shared/Preview/Card";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { ExternalPortal } from "./model";

export type Props = PublicProps<ExternalPortal>;

export default function Component(props: Props) {
  const environment = useStore((state) => state.previewEnvironment);

  if (environment !== "standalone") {
    return (
      <Card handleSubmit={props.handleSubmit}>
        <WarningContainer>
          <ErrorOutline />
          <Typography variant="body1" sx={{ ml: 2 }}>
            {`This is a nested flow placeholder (flowId: ${props.flowId}).`}
            <br />
            <br />
            To view nested flow content, please use a Preview or Published
            route.
          </Typography>
        </WarningContainer>
      </Card>
    );
  }

  return null;
}
