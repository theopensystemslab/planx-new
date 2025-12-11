import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { sendResumeEmail } from "lib/api/saveAndReturn/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback, useEffect } from "react";

import StatusPage from "../StatusPage";
import { EmailRequired } from ".";

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
        We have saved your progress. We will try to send the email again later.
      </Typography>
    </StatusPage>
  );
};

export const EmailSuccess: React.FC = () => {
  return (
    <StatusPage bannerHeading="Check your email">
      <Typography variant="body1">
        If you have any draft forms we have sent you an email that contains a
        link. Use this link to access your forms.
        <br />
        <br />
        You may now close this tab.
      </Typography>
    </StatusPage>
  );
};

const SendResumeEmail: React.FC<{ initialEmail: string }> = ({
  initialEmail,
}) => {
  const teamSlug = useStore((state) => state.teamSlug);

  const { mutate, isPending, isSuccess, isError, variables } = useMutation({
    mutationFn: sendResumeEmail,
  });

  const handleSubmit = useCallback(
    (submittedEmail: string) => {
      mutate({
        payload: { email: submittedEmail, teamSlug },
      });
    },
    [teamSlug, mutate],
  );

  useEffect(() => {
    if (initialEmail) handleSubmit(initialEmail);
  }, [initialEmail, handleSubmit]);

  const retrySameEmail = () => handleSubmit(initialEmail);

  if (isPending) return <DelayedLoadingIndicator text="Sending..." />;
  if (isSuccess) return <EmailSuccess />;
  if (isError) return <EmailError retry={retrySameEmail} />;

  return <EmailRequired handleSubmit={handleSubmit} />;
};

export default SendResumeEmail;
