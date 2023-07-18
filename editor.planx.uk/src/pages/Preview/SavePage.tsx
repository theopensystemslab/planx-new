import Typography from "@mui/material/Typography";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { add } from "date-fns";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { SendEmailPayload } from "types";

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
    buttonText="Close tab"
    onButtonClick={() => window.close()}
    additionalOption="startNewApplication"
  >
    <Typography variant="body2">
      We have sent a link to {saveToEmail}. Use the link to continue your
      application.
      <br />
      <br />
      You have until {expiryDate} to complete this application.
      <br />
      <br />
      Your application will be deleted if you do not complete it by this date.
    </Typography>
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
    const url = `${process.env.REACT_APP_API_URL}/send-email/save`;
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
