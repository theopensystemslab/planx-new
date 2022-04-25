import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";
import { linkStyle } from "theme";
import Banner from "ui/Banner";

interface Props {
  bannerHeading: string;
  bannerText: string;
  cardText: string;
  buttonText?: string;
  onButtonClick?: () => void;
  altButtonText?: string;
  onAltButtonClick?: () => void;
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
}) => {
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
