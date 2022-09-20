import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Card from "@planx/components/shared/Preview/Card";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { linkStyle } from "theme";
import Banner from "ui/Banner";

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

const useStyles = makeStyles((theme) => ({
  linkButton: {
    ...linkStyle,
    marginTop: theme.spacing(2.5),
  },
}));

const StatusPage: React.FC<Props> = ({
  bannerHeading,
  bannerText,
  buttonText,
  onButtonClick,
  showDownloadLink,
  additionalOption,
  children,
}) => {
  const [breadcrumbs, flow, passport, sessionId] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.sessionId,
  ]);

  // make a CSV data structure based on the payloads we Send to BOPs/Uniform
  const data = makeCsvData(breadcrumbs, flow, passport, sessionId);

  const theme = useTheme();
  const classes = useStyles();

  // Drop sessionId from URL to route to ApplicationPath.SaveAndReturn, not ApplicationPath.Resume
  const startNewApplication = () => {
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.delete("sessionId");
    window.history.pushState({}, document.title, currentURL);
    window.location.reload();
  };

  return (
    <>
      <Box width="100%">
        <Banner
          heading={bannerHeading}
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
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
          >
            {buttonText}
          </Button>
        )}
        {additionalOption === "startNewApplication" && (
          <>
            <Typography variant="body2">or</Typography>
            <ButtonBase
              className={classes.linkButton}
              onClick={startNewApplication}
            >
              <Typography variant="body2">Start new application</Typography>
            </ButtonBase>
          </>
        )}
      </Card>
    </>
  );
};

export default StatusPage;
