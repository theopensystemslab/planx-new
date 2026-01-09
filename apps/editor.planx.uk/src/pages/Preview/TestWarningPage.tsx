import Box from "@mui/material/Box";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";

export const TestWarningPage = ({ children }: PropsWithChildren) => {
  const { hasAcknowledgedWarning, setHasAcknowledgedWarning } = useStore();
  return (
    <>
      {hasAcknowledgedWarning ? (
        children
      ) : (
        <Box width="100%">
          <Card handleSubmit={() => setHasAcknowledgedWarning()}>
            <CardHeader
              title="This is a test environment"
              description='This version of the service is unpublished and for previewing content changes only. "Send" integrations and features like "save & return" and "invite to pay" are not available on this link. Please use the "/published" link for end-to-end submissions.'
            ></CardHeader>
          </Card>
        </Box>
      )}
    </>
  );
};
