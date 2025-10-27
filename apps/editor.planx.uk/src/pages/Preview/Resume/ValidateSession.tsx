import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { PaymentRequest } from "@opensystemslab/planx-core/types";
import { useMutation } from "@tanstack/react-query";
import { APIError } from "api/client";
import { validateSession } from "api/saveAndReturn/requests";
import { ReconciliationResponse, SessionAuthPayload } from "api/saveAndReturn/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback, useEffect } from "react";
import { Link as ReactNaviLink } from "react-navi";
import { ApplicationPath } from "types";

import ReconciliationPage from "../ReconciliationPage";
import StatusPage from "../StatusPage";
import { EmailRequired } from ".";

// A minimal representation of a PaymentRequest for display purposes
type MinPaymentRequest = Pick<
  PaymentRequest,
  "id" | "payeeEmail" | "payeeName"
>;

export interface LockedSessionResponse {
  paymentRequest: MinPaymentRequest;
  status: number;
  message: string;
}

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
      <br />
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

export const ValidationSuccess: React.FC<{
  reconciliationResponse: ReconciliationResponse;
  continueApplication: () => void;
}> = ({ reconciliationResponse, continueApplication }) => {
  return (
    <ReconciliationPage
      bannerHeading="Resume your application"
      reconciliationResponse={reconciliationResponse}
      buttonText="Continue"
      onButtonClick={continueApplication}
    ></ReconciliationPage>
  );
};

const ValidateSession: React.FC<{
  sessionId: string;
  initialEmail: string;
}> = ({ sessionId, initialEmail }) => {
  const resumeSession = useStore((state) => state.resumeSession);

  /**
   * Continue application following successful validation & reconciliation
   * Updating path will navigate user back to questions
   */
  const continueApplication = (): void => {
    useStore.setState({ path: ApplicationPath.SaveAndReturn });
  };

  const {
    mutate,
    data,
    reset,
    isPending,
    isSuccess,
    isError,
    error,
    variables,
  } = useMutation<ReconciliationResponse, APIError<LockedSessionResponse>, SessionAuthPayload>({
    mutationFn: validateSession,
    onSuccess: (data) => resumeSession(data.reconciledSessionData),
    onError: console.debug,
  });

  const handleSubmit = useCallback(
    (submittedEmail: string) => {
      mutate({
        payload: { email: submittedEmail, sessionId },
      });
    },
    [sessionId, mutate],
  );

  useEffect(() => {
    if (initialEmail) handleSubmit(initialEmail);
  }, [initialEmail, handleSubmit]);

  const retryWithNewEmailAddress = () => reset();

  if (isPending) return <DelayedLoadingIndicator text="Validating..." />;

  if (isError) {
    if (error.statusCode === 403) return (
      <LockedSession paymentRequest={error.data.paymentRequest} />
    );

    return <InvalidSession retry={retryWithNewEmailAddress} />;
  }

  if (isSuccess) {
    useStore.setState({ saveToEmail: variables.payload.email });

    const shouldSkipReconciliation = data.message.match(
      /Payment process initiated, skipping reconciliation/,
    );
    if (shouldSkipReconciliation) {
      continueApplication();
      return null;
    }

    return <ValidationSuccess reconciliationResponse={data} continueApplication={continueApplication}/>
  }

  return <EmailRequired handleSubmit={handleSubmit} />;
};

export default ValidateSession;
