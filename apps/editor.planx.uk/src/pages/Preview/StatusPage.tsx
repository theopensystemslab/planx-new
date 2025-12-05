import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card, {
  contentFlowSpacing,
} from "@planx/components/shared/Preview/Card";
import React, { type PropsWithChildren } from "react";
import Banner from "ui/public/Banner";
import ViewApplicationLink from "ui/public/ViewApplicationLink";
import { removeSessionIdSearchParam } from "utils";

interface Props {
  bannerHeading: string;
  bannerText?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  showDownloadLink?: boolean;
  additionalOption?: "startNewApplication";
}

const StatusPage: React.FC<PropsWithChildren<Props>> = ({
  bannerHeading,
  bannerText,
  buttonText,
  onButtonClick,
  showDownloadLink,
  additionalOption,
  children,
}) => {
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
        {showDownloadLink && <ViewApplicationLink/> }
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
