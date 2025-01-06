import Box from "@mui/material/Box";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import React, { PropsWithChildren, useState } from "react";

export const TestWarningPage = ({ children }: PropsWithChildren) => {
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  return (
    <>
      {hasAcknowledgedWarning ? (
        children
      ) : (
        <Box width="100%">
          <Card handleSubmit={() => setHasAcknowledgedWarning(true)}>
            <CardHeader
              title="This is a test environment"
              description="This version of the service is unpublished and for testing only. Do not use it to submit real applications"
            ></CardHeader>
          </Card>
        </Box>
      )}
    </>
  );
};
