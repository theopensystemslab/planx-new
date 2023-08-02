import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { PaymentRequest } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { useCurrentRoute } from "react-navi";
import { Link as ReactNaviLink } from "react-navi";
import type { ReconciliationResponse, Session } from "types";
import { ApplicationPath, SendEmailPayload } from "types";
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
  LockedSession,
}
// A minimal representation of a PaymentRequest for display purposes
type MinPaymentRequest = Pick<
  PaymentRequest,
  "id" | "payeeEmail" | "payeeName"
>;

interface LockedSessionResponse {
  paymentRequest: MinPaymentRequest;
  status: number;
  message: string;
}

export const EmailRequired: React.FC<{ setEmail: (email: string) => void }> = ({
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
                formik.touched.email && formik.errors.email
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

export const EmailError: React.FC<{ retry: () => void }> = ({ retry }) => {
  return (
    <StatusPage
      bannerHeading="Email not sent"
      buttonText="Retry"
      onButtonClick={retry}
    >
      <Typography variant="body1">
        We are having trouble sending emails at the moment.
        <br />
        <br />
        We have saved your application. We will try to send the email again
        later.
      </Typography>
    </StatusPage>
  );
};

export const EmailSuccess: React.FC = () => {
  return (
    <StatusPage
      bannerHeading="Check your email"
      buttonText="Close Tab"
      onButtonClick={() => window.close()}
    >
      <Typography variant="body1">
        If you have any draft applications we have sent you an email that
        contains a link. Use this link to access your applications.
      </Typography>
    </StatusPage>
  );
};

export const ValidationSuccess: React.FC<{
  reconciliationResponse: ReconciliationResponse;
  continueApplication: () => void;
}> = ({ reconciliationResponse, continueApplication }) => {
  return (
    <ReconciliationPage
      bannerHeading="Resume your application"
      reconciliationResponse={reconciliationResponse}
      buttonText="Continue"
      onButtonClick={() => continueApplication()}
    ></ReconciliationPage>
  );
};

export const InvalidSession: React.FC<{
  retry: () => void;
}> = ({ retry }) => (
  <StatusPage
    bannerHeading="We can't find your application"
    buttonText="Try again"
    onButtonClick={retry}
    additionalOption="startNewApplication"
  >
    <Typography variant="h3" component="h2">
      Reasons
    </Typography>
    <Typography variant="body1">
      This may be because your application has expired or there was a mistake in
      your email address.
      <br />
      <br />
      Try entering your email address again.
    </Typography>
  </StatusPage>
);

export const LockedSession: React.FC<{
  paymentRequest?: MinPaymentRequest;
}> = ({ paymentRequest }) => (
  <StatusPage
    bannerHeading="Sorry, you can't make changes to this application"
    additionalOption="startNewApplication"
  >
    <Typography variant="body1">
      This is because you've invited {paymentRequest?.payeeName} (
      <Link href={`mailto:${paymentRequest?.payeeEmail}`}>
        {paymentRequest?.payeeEmail}
      </Link>
      ) to pay for this application and changes might affect the fee.
      <br />
      <br />
      You can{" "}
      <Link
        component={ReactNaviLink}
        href={`../pay?paymentRequestId=${paymentRequest?.id}`}
      >
        pay for this application yourself on the payment page
      </Link>
    </Typography>
  </StatusPage>
);

/**
 * If an email is passed in as a query param, do not prompt a user for this
 * Currently only used for redirects back from GovUK Pay
 * XXX: Won't work locally as referrer is stripped from the browser when navigating from HTTPS to HTTP (localhost)
 */
const getInitialEmailValue = () => {
  const emailQueryParam = useCurrentRoute().url.query.email;
  const isRedirectFromGovPay = [
    "https://www.payments.service.gov.uk/",
    "https://card.payments.service.gov.uk/",
  ].includes(document.referrer);

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
  const [paymentRequest, setPaymentRequest] = useState<MinPaymentRequest>();
  const sessionId = useCurrentRoute().url.query.sessionId;
  const [reconciliationResponse, setReconciliationResponse] =
    useState<ReconciliationResponse>();

  useEffect(() => {
    if (email) handleSubmit();
  }, [email]);

  const teamSlug = useStore((state) => state.teamSlug);
  const resumeSession = useStore((state) => state.resumeSession);

  /**
   * Continue application following successful validation & reconciliation
   */
  const continueApplication = (): void => {
    useStore.setState({
      saveToEmail: email,
      path: ApplicationPath.SaveAndReturn,
    });
  };

  /**
   * Send magic link to user, based on submitted email
   * Sets page status based on validation of request by API
   */
  const sendResumeEmail = async () => {
    const url = `${process.env.REACT_APP_API_URL}/resume-application`;
    const data = {
      payload: { email, teamSlug },
    };
    try {
      await axios.post(url, data);
      setPageStatus(Status.Success);
    } catch (error) {
      setPageStatus(Status.Error);
    }
  };

  /**
   * Check if applicant has initialised the payment process
   * XXX: Pay component is still responsible for validating payment status and updating passport
   */
  const isPaymentCreated = (data: Session): boolean => {
    return data.govUkPayment?.state?.status === "created";
  };

  /**
   * Query DB to validate that sessionID & email match
   */
  const validateSessionId = async () => {
    const url = `${process.env.REACT_APP_API_URL}/validate-session`;
    const data: SendEmailPayload = {
      payload: { email, sessionId },
    };
    try {
      // Find this session, if found then handle reconciliation
      await axios.post(url, data).then((response) => {
        if (response.data) {
          const reconciledSessionData = response.data.reconciledSessionData;
          setReconciliationResponse(response.data);
          resumeSession(reconciledSessionData);
          // Skip reconciliation page if applicant has started payment
          isPaymentCreated(reconciledSessionData)
            ? continueApplication()
            : setPageStatus(Status.Validated);
        }
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          const lockedSessionResponse = error.response
            .data as LockedSessionResponse;
          setPaymentRequest(lockedSessionResponse.paymentRequest);
          setPageStatus(Status.LockedSession);
          return;
        }
      }
      console.debug(error);
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
      />
    ),
    [Status.Validated]: (
      <ValidationSuccess
        reconciliationResponse={reconciliationResponse!}
        continueApplication={continueApplication}
      />
    ),
    [Status.InvalidSession]: (
      <InvalidSession retry={retryWithNewEmailAddress} />
    ),
    [Status.LockedSession]: <LockedSession paymentRequest={paymentRequest} />,
    [Status.Success]: <EmailSuccess />,
    [Status.Error]: <EmailError retry={() => handleSubmit()} />,
  }[pageStatus];
};

export default ResumePage;
