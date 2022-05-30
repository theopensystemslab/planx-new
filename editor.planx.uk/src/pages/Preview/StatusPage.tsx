import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { linkStyle } from "theme";
import Banner from "ui/Banner";

import { makeCsvData } from "../../@planx/components/Send/uniform";
import FileDownload from "../../ui/FileDownload";

interface Props {
  bannerHeading: string;
  bannerText: string;
  cardText: string;
  buttonText?: string;
  onButtonClick?: () => void;
  altButtonText?: string;
  onAltButtonClick?: () => void;
  showDownloadLink?: boolean;
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
  cardText,
  buttonText,
  onButtonClick,
  altButtonText,
  onAltButtonClick,
  showDownloadLink,
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
          <Box mt={4}>
            <Typography>{bannerText}</Typography>
          </Box>
        </Banner>
      </Box>
      <Card>
        <Typography variant="body2">{cardText}</Typography>
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
        {altButtonText && (
          <>
            <Typography variant="body2">or</Typography>
            <ButtonBase
              className={classes.linkButton}
              onClick={onAltButtonClick}
            >
              <Typography variant="body2">{altButtonText}</Typography>
            </ButtonBase>
          </>
        )}
      </Card>
    </>
  );
};

export default StatusPage;
