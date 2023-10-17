import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Banner from "ui/Banner";
import { removeSessionIdSearchParam } from "utils";

import { makeCsvData } from "../../@planx/components/Send/uniform";
import FileDownload from "../../ui/FileDownload";

interface Props {
  bannerHeading: string;
  bannerText?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  showDownloadLink?: boolean;
  additionalOption?: "startNewApplication";
  children?: React.ReactNode;
}

const StatusPage: React.FC<Props> = ({
  bannerHeading,
  bannerText,
  buttonText,
  onButtonClick,
  showDownloadLink,
  additionalOption,
  children,
}) => {
  const [breadcrumbs, flow, passport, sessionId, flowName] = useStore(
    (state) => [
      state.breadcrumbs,
      state.flow,
      state.computePassport(),
      state.sessionId,
      state.flowName,
    ],
  );

  // make a CSV data structure based on the payloads we Send to BOPs/Uniform
  const data = makeCsvData({
    breadcrumbs,
    flow,
    flowName,
    passport,
    sessionId,
  });

  const theme = useTheme();

  return (
    <>
      <Box width="100%">
        <Banner
          heading={bannerHeading}
          color={{
            background: theme.palette.info.light,
            text: theme.palette.text.primary,
          }}
        >
          {bannerText && (
            <Box mt={4}>
              <Typography>{bannerText}</Typography>
            </Box>
          )}
        </Banner>
      </Box>
      <Card>
        {children}
        {showDownloadLink && (
          <FileDownload data={data} filename={sessionId || "application"} />
        )}
        {buttonText && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onButtonClick}
            sx={{ mt: 4 }}
          >
            {buttonText}
          </Button>
        )}
        {additionalOption === "startNewApplication" && (
          <>
            <Typography sx={contentFlowSpacing} variant="body1">
              or
            </Typography>
            <Link
              component="button"
              onClick={removeSessionIdSearchParam}
              sx={contentFlowSpacing}
            >
              <Typography variant="body1" align="left">
                Start new application
              </Typography>
            </Link>
          </>
        )}
      </Card>
    </>
  );
};

export default StatusPage;
