import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { add } from "date-fns";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { SendEmailPayload } from "types";
import { removeSessionIdSearchParam } from "utils";

import StatusPage from "./StatusPage";

enum Status {
  Sending,
  Success,
  Error,
}

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
        {saveToEmail}
      </Typography>
      <Typography variant="body2">
        Use the link to continue your application. You have until {expiryDate}{" "}
        to complete this application. Your application will be deleted if you do
        not complete it by this date.
      </Typography>
      <Typography variant="body2">
        To see all of your applications visit{" "}
        <Link
          href="https://localplanning.4962.planx.pizza/applications/"
          target="_blank"
        >
          Local planning services (opens in a new tab)
        </Link>
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
  const saveToEmail = useStore((state) => state.saveToEmail);
  // Assume rolling 28 days - just a placeholder value in case of backend failure
  const placeholderExpiryDate = add(new Date(), { days: 28 }).toDateString();

  const [pageStatus, setPageStatus] = useState<Status>(Status.Sending);
  const [expiryDate, setExpiryDate] = useState<string>(placeholderExpiryDate);

  const sendNotifyEmail = async () => {
    const url = `${import.meta.env.VITE_APP_API_URL}/send-email/save`;
    const { sessionId } = useStore.getState();
    const data: SendEmailPayload = {
      payload: { email: saveToEmail, sessionId },
    };
    try {
      const response = await axios.post(url, data);
      setPageStatus(Status.Success);
      setExpiryDate(response?.data?.expiryDate || placeholderExpiryDate);
    } catch (error) {
      console.error(error);
      setPageStatus(Status.Error);
      // TODO: Catch error details here
    }
  };

  useEffect(() => {
    saveToEmail ? sendNotifyEmail() : setPageStatus(Status.Error);
  }, []);

  return {
    [Status.Sending]: <DelayedLoadingIndicator text={"Sending..."} />,
    [Status.Success]: (
      <SaveSuccess saveToEmail={saveToEmail} expiryDate={expiryDate} />
    ),
    [Status.Error]: <SaveError />,
  }[pageStatus];
};

export default SavePage;
