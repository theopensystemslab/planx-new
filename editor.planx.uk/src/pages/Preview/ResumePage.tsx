import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import axios, { AxiosError } from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { getCookie } from "lib/cookie";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { useCurrentRoute } from "react-navi";
import { ApplicationPath } from "types";
import Banner from "ui/Banner";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import { object, string } from "yup";

enum Status {
  EmailRequired,
  Validating,
  Success,
  Invalid,
  Error,
}

const EmailRequired: React.FC<{ setEmail: (email: string) => void }> = ({
  setEmail,
}) => {
  const emailSchema = object({
    email: string().email("Invalid email").required("Email address required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: (values) => setEmail(values.email),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: emailSchema,
  });

  return (
    <Box width="100%" role="main">
      <Card handleSubmit={formik.handleSubmit}>
        <QuestionHeader
          title="Resume your application"
          description="Please enter your email below to resume a previously started application."
        ></QuestionHeader>
        <InputRow>
          <InputLabel label={"Email Address"} htmlFor={"email"}>
            <Input
              bordered
              errorMessage={
                Boolean(formik.touched.email && formik.errors.email)
                  ? formik.errors.email
                  : undefined
              }
              id="email"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
            ></Input>
          </InputLabel>
        </InputRow>
      </Card>
    </Box>
  );
};

const EmailError: React.FC<{ retry: () => void; email: string }> = ({
  retry,
  email,
}) => {
  const theme = useTheme();

  return (
    <>
      <Box width="100%">
        <Banner
          heading="Error sending email"
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
          }}
        >
          <Box mt={4}>
            <Typography>Failed to send email to {email}</Typography>
          </Box>
        </Banner>
      </Box>
      <Card>
        <Typography variant="body2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sapien
          nunc, blandit et cursus nec, auctor at leo. Donec eros enim, tristique
          sit amet enim iaculis.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={retry}
        >
          Retry
        </Button>
      </Card>
    </>
  );
};

const EmailInvalid: React.FC<{ email: string }> = ({ email }) => {
  const theme = useTheme();

  return (
    <>
      <Box width="100%">
        <Banner
          heading="Invalid email address"
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
          }}
        >
          <Box mt={4}>
            <Typography>Invalid email address: {email}.</Typography>
          </Box>
        </Banner>
      </Box>
      <Card>
        <Typography variant="body2">
          We weren't able to find any open applications matching the provided
          details. Please click below to begin a new application.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => location.reload()}
        >
          Start a new application
        </Button>
      </Card>
    </>
  );
};

const EmailSuccess: React.FC<{ email: string }> = ({ email }) => {
  const theme = useTheme();

  return (
    <>
      <Box width="100%">
        <Banner
          heading="Email sent"
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
          }}
        >
          <Box mt={4}>
            <Typography>
              We have sent a link to {email}. Use that link to continue your
              application.
            </Typography>
          </Box>
        </Banner>
      </Box>
      <Card>
        <Typography variant="body2">
          You will need to open the email we have sent you in order to proceed.
          You are now free to close this tab.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => window.close()}
        >
          Close Tab
        </Button>
      </Card>
    </>
  );
};

/**
 * Explain two "paths"
 */
const ResumePage: React.FC = () => {
  const [pageStatus, setPageStatus] = useState<Status>(Status.EmailRequired);
  const [email, setEmail] = useState<string>("");
  const sessionId = useCurrentRoute().url.query.sessionId;

  useEffect(() => {
    if (email) handleSubmit();
  }, [email]);

  /**
   * Send magic link to user, based on submitted email
   * Sets page status based on validation of request by API
   */
  const sendResumeEmail = async () => {
    const url = `${process.env.REACT_APP_API_URL}/resume-application`;
    const flowId = useStore.getState().id;
    // TODO: Type for this
    const data = { email: email, flowId: flowId };
    const token = getCookie("jwt");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await axios.post(url, data, config);
      setPageStatus(Status.Success);
    } catch (error) {
      // Handle API specific errors
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setPageStatus(Status.Invalid);
      }
      // Handle all other errors
      setPageStatus(Status.Error);
    }
  };

  /**
   * Temp placeholder function for dev testing
   * Query DB to validate that sessionID and email match
   */
  const validateSessionId = () => {
    setTimeout(() => {
      useStore.getState().setSaveToEmail(email);
      useStore.getState().setPath(ApplicationPath.SaveAndReturn);
      // TODO: Reconciliation...!
    }, 500);
  };

  /**
   * Handle both submit "paths" that leads a user to this page
   */
  const handleSubmit = () => {
    setPageStatus(Status.Validating);
    sessionId ? validateSessionId() : sendResumeEmail();
  };

  return {
    [Status.EmailRequired]: <EmailRequired setEmail={setEmail} />,
    [Status.Validating]: (
      <DelayedLoadingIndicator
        text={sessionId ? "Validating..." : "Sending..."}
        msDelayBeforeVisible={0}
      />
    ),
    [Status.Success]: <EmailSuccess email={email} />,
    [Status.Invalid]: <EmailInvalid email={email} />,
    [Status.Error]: <EmailError retry={() => handleSubmit()} email={email} />,
  }[pageStatus];
};

export default ResumePage;
