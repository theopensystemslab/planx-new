import Box from "@material-ui/core/Box";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { useCurrentRoute } from "react-navi";
import { ApplicationPath } from "types";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import { object, string } from "yup";

import StatusPage from "./StatusPage";

enum Status {
  EmailRequired,
  Validating,
  Success,
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
  return (
    <StatusPage
      bannerHeading="Error sending email"
      bannerText={`Failed to send email to ${email}`}
      cardText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sapien
      nunc, blandit et cursus nec, auctor at leo. Donec eros enim, tristique
      sit amet enim iaculis."
      buttonText="Retry"
      onButtonClick={retry}
    ></StatusPage>
  );
};

const EmailSuccess: React.FC<{ email: string }> = ({ email }) => {
  return (
    <StatusPage
      bannerHeading="Request successful"
      bannerText={`If we hold any draft applications for ${email}, an email will be sent to that address. Please use that link to continue your
      application.`}
      cardText="You will need to open the email we have sent you in order to proceed.
      You are now free to close this tab."
      buttonText="Close Tab"
      onButtonClick={() => window.close()}
    ></StatusPage>
  );
};

/**
 * Component which handles the "Resume" page used for Save & Return
 * The user can access this page via two "paths"
 * 1. Directly via PlanX, user enters email to trigger "dashboard" email with resume magic links
 * 2. Magic link in email with a sessionId, user enters email to continue application
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
    const data = { email: email, flowId: flowId };
    try {
      await axios.post(url, data);
      setPageStatus(Status.Success);
    } catch (error) {
      setPageStatus(Status.Error);
    }
  };

  /**
   * Query DB to validate that sessionID and email match
   */
  const validateSessionId = async () => {
    const url = `${process.env.REACT_APP_API_URL}/validate-session`;
    const data = { email: email, sessionId: sessionId };
    try {
      await axios.post(url, data);
      useStore.getState().setSaveToEmail(email);
      useStore.getState().setPath(ApplicationPath.SaveAndReturn);
      // Remove sessionId query param from URL
      window.history.pushState({}, document.title, window.location.pathname);
      // TODO: Reconciliation...!
    } catch (error) {
      setPageStatus(Status.Error);
    }
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
    [Status.Error]: <EmailError retry={() => handleSubmit()} email={email} />,
  }[pageStatus];
};

export default ResumePage;
