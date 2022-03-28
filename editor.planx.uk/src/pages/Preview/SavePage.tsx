import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { add } from "date-fns";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Banner from "ui/Banner";

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  linkButton: {
    marginTop: theme.spacing(2.5),
    display: "inline-block",
    cursor: "pointer",
  },
}));

const SavePage: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  // Assume rolling 28 days - just a placeholder value
  const expiryDate = add(new Date(), { days: 28 }).toDateString();
  const applicantEmail = useStore.getState().applicantEmail;

  return (
    <>
      <Box width="100%">
        <Banner
          heading="Application saved"
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
          }}
        >
          <Box mt={4}>
            <Typography>
              We have sent a link to {applicantEmail}. Use that link to continue
              your application.
            </Typography>
          </Box>
        </Banner>
      </Box>
      <Card>
        <Typography variant="body2">
          You have until {expiryDate} to complete and submit this application,
          or it will be deleted to protect your privacy.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => window.close()}
        >
          Close Tab
        </Button>
        <Typography variant="body2">or</Typography>
        {/* TODO: Make this keyboard navigable */}
        <Link className={classes.linkButton} onClick={() => location.reload()}>
          Start a new application
        </Link>
      </Card>
    </>
  );
};

export default SavePage;
