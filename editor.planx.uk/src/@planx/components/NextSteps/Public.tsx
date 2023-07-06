import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React from "react";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { NextSteps } from "./model";

type Props = PublicProps<NextSteps>;

export default Component;

function Component(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader {...props} />
      <Box>
        <Typography variant="h2" style={{ color: "orangered" }}>
          UNDER DEVELOPMENT
        </Typography>
      </Box>
    </Card>
  );
}
