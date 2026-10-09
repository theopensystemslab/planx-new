import Box from "@mui/material/Box";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useStore } from "pages/FlowEditor/lib/store";
import type { PropsWithChildren } from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";

export const TestWarningPage = ({ children }: PropsWithChildren) => {
  const { hasAcknowledgedWarning, setHasAcknowledgedWarning } = useStore();
  return (
    <>
      {hasAcknowledgedWarning ? (
        children
      ) : (
        <Box sx={{ width: "100%" }}>
          <WatermarkBackground variant="dark" opacity={0.05} />
          <Card handleSubmit={() => setHasAcknowledgedWarning()}>
            <CardHeader
              title="This is a test environment"
              description={[
                "<p>Sending is not available in preview. You can continue through the service, but no submission will be sent.</p>",
                "<p>To test sending a submission, use the published version of the service in the staging environment.</p>",
                '<p><a href="https://opensystemslab.notion.site/25-Test-your-Submit-services-459a91cfc50d4f4aafafa56c770ae1f7" target="_blank" rel="noopener noreferrer">Read the guide to testing submission services (opens in a new tab)</a></p>',
              ].join("")}
            ></CardHeader>
          </Card>
        </Box>
      )}
    </>
  );
};
