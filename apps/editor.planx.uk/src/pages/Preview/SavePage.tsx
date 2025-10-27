import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { sendSaveEmail } from "api/saveAndReturn/requests";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { removeSessionIdSearchParam } from "utils";

import StatusPage from "./StatusPage";

export const SaveSuccess: React.FC<{
  saveToEmail?: string;
  expiryDate?: string;
}> = ({ saveToEmail, expiryDate }) => (
  <StatusPage
    bannerHeading="Application saved"
    showDownloadLink
    buttonText="Start a new application"
    onButtonClick={removeSessionIdSearchParam}
  >
    <Stack spacing={1}>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        We have sent a link to:
      </Typography>
      <Typography
        component="span"
        variant="body2"
        sx={{
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {saveToEmail}.
      </Typography>
      <Typography variant="body2">
        Use the link to continue your application. You have until {expiryDate}{" "}
        to complete this application. Your application will be deleted if you do
        not complete it by this date.
      </Typography>
      <Typography variant="body2">You may now close this tab.</Typography>
    </Stack>
  </StatusPage>
);

export const SaveError: React.FC = () => {
  return (
    <StatusPage bannerHeading="Email not sent" showDownloadLink>
      <Typography variant="body2">
        We are having trouble sending emails at the moment.
        <br />
        <br />
        We have saved your application. We will try to send the email again
        later.
      </Typography>
    </StatusPage>
  );
};

const SavePage: React.FC = () => {
  const [saveToEmail, sessionId] = useStore((state) => [
    state.saveToEmail,
    state.sessionId,
  ]);

  const {
    mutate: sendNotifyEmail,
    isSuccess,
    isError,
    data,
  } = useMutation({
    mutationFn: sendSaveEmail,
    onError: (error) => console.error(error),
  });

  useEffect(() => {
    if (!saveToEmail) return;

    sendNotifyEmail({ payload: { sessionId, email: saveToEmail } });
  }, [sendNotifyEmail, sessionId, saveToEmail]);

  if (!saveToEmail || isError) return <SaveError />;
  if (isSuccess) {
    return (
      <SaveSuccess saveToEmail={saveToEmail} expiryDate={data.expiryDate} />
    );
  }

  return <DelayedLoadingIndicator text={"Saving..."} />;
};

export default SavePage;
