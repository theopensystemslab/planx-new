import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { QuestionAndResponses } from "@opensystemslab/planx-core/types";
import Card, {
  contentFlowSpacing,
} from "@planx/components/shared/Preview/Card";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import Banner from "ui/public/Banner";
import { removeSessionIdSearchParam } from "utils";

import FileDownload from "../../ui/public/FileDownload";

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
  const theme = useTheme();
  const [data, setData] = useState<QuestionAndResponses[]>([]);

  const [sessionId, $public] = useStore((state) => [
    state.sessionId,
    state.$public,
  ]);

  useEffect(() => {
    async function makeCsvData() {
      const csvData = await $public.export.csvData(sessionId);
      if (csvData) {
        setData(csvData);
      }
    }

    if (data.length < 1) {
      makeCsvData();
    }
  });

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
