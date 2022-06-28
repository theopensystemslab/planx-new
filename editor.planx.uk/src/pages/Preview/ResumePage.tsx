import Box from "@material-ui/core/Box";
import { useTeamSlug } from "@planx/components/shared/hooks";
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

import ReconciliationPage from "./ReconciliationPage";
import StatusPage from "./StatusPage";

enum Status {
  EmailRequired,
  Validating,
  Validated,
  InvalidSession,
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
          description="Enter your email to resume your application."
        ></QuestionHeader>
        <InputRow>
          <InputLabel label={"Email address"} htmlFor={"email"}>
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

const EmailError: React.FC<{ retry: () => void }> = ({ retry }) => {
  return (
    <StatusPage
      bannerHeading="Error sending email"
      bannerText="We are having trouble sending emails at the moment."
      cardText="Your application has been saved. We will try to send the email again later."
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

const ValidationSuccess: React.FC<{
  data: any;
  email: string;
  sessionId: string;
}> = ({ data, email, sessionId }) => {
  return (
    <ReconciliationPage
      bannerHeading="Resume your application"
      diffMessage={data?.message || ""}
      data={data}
      buttonText="Continue"
      onButtonClick={() =>
        useStore.setState({
          saveToEmail: email,
          sessionId: sessionId,
          path: ApplicationPath.SaveAndReturn,
        })
      }
    ></ReconciliationPage>
  );
};

const InvalidSession: React.FC<{
  retry: () => void;
}> = ({ retry }) => {
  return (
    <StatusPage
      bannerHeading="We can't find your application"
      bannerText='Click "Try Again" enter your email address again, or start a new application'
      cardText=""
      buttonText="Try again"
      onButtonClick={retry}
      altButtonText="Start a new application"
      onAltButtonClick={() => window.location.reload()}
    ></StatusPage>
  );
};

/**
 * If an email is passed in as a query param, do not prompt a user for this
 * Currently only used for redirects back from GovUK Pay
 */
const getInitialEmailValue = () => {
  const emailQueryParam = useCurrentRoute().url.query.email;
  const isRedirectFromGovPay =
    document.referrer === "https://www.payments.service.gov.uk/";
  if (isRedirectFromGovPay && emailQueryParam) return emailQueryParam;
  return "";
};

/**
 * Component which handles the "Resume" page used for Save & Return
 * The user can access this page via three "paths"
 * 1. Directly via PlanX, user enters email to trigger "dashboard" email with resume magic links
 * 2. Magic link in email with a sessionId, user enters email to continue application
 * 3. Redirect back from GovPay - sessionId and email come from query params
 */
const ResumePage: React.FC = () => {
  const [pageStatus, setPageStatus] = useState<Status>(Status.EmailRequired);
  const [email, setEmail] = useState<string>(getInitialEmailValue());
  const sessionId = useCurrentRoute().url.query.sessionId;
  const [reconciledData, setReconciledData] = useState<
    Record<any, any> | undefined
  >();

  useEffect(() => {
    if (email) handleSubmit();
  }, [email]);

  /**
   * Send magic link to user, based on submitted email
   * Sets page status based on validation of request by API
   */
  const sendResumeEmail = async () => {
    const url = `${process.env.REACT_APP_API_URL}/resume-application`;
    const teamSlug = useTeamSlug();
    const data = { email: email, teamSlug };
    try {
      await axios.post(url, data);
      setPageStatus(Status.Success);
    } catch (error) {
      setPageStatus(Status.Error);
    }
  };

  /**
   * Query DB to validate that sessionID & email match
   */
  const validateSessionId = async () => {
    const url = `${process.env.REACT_APP_API_URL}/validate-session`;
    const data = { email, sessionId };
    try {
      // Remove sessionId query param from URL before validation request
      //   so that 404/Status.InvalidSession will reload window.location without params on "retry" button
      window.history.pushState({}, document.title, window.location.pathname);
      // Find this session, if found then handle reconciliation
      await axios.post(url, data).then((response) => {
        setReconciledData(response?.data);
        setPageStatus(Status.Validated);
      });
    } catch (error) {
      setPageStatus(Status.InvalidSession);
    }
  };

  /**
   * Handle all submit "paths" that leads a user to this page
   */
  const handleSubmit = () => {
    setPageStatus(Status.Validating);
    sessionId ? validateSessionId() : sendResumeEmail();
  };

  /**
   * Allow user to try again, with a different email address
   */
  const retryWithNewEmailAddress = () => {
    setEmail("");
    setPageStatus(Status.EmailRequired);
  };

  return {
    [Status.EmailRequired]: <EmailRequired setEmail={setEmail} />,
    [Status.Validating]: (
      <DelayedLoadingIndicator
        text={sessionId ? "Validating..." : "Sending..."}
        msDelayBeforeVisible={0}
      />
    ),
    [Status.Validated]: (
      <ValidationSuccess
        data={reconciledData}
        email={email}
        sessionId={sessionId}
      />
    ),
    [Status.InvalidSession]: (
      <InvalidSession retry={retryWithNewEmailAddress} />
    ),
    [Status.Success]: <EmailSuccess email={email} />,
    [Status.Error]: <EmailError retry={() => handleSubmit()} />,
  }[pageStatus];
};

export default ResumePage;
