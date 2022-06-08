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

const SaveSuccess: React.FC<{ saveToEmail?: string; expiryDate?: string }> = ({
  saveToEmail,
  expiryDate,
}) => {
  return (
    <>
      <StatusPage
        bannerHeading="Application saved"
        bannerText={`We have sent a link to ${saveToEmail}. Use that link to continue your application.`}
        cardText={`You have until ${expiryDate} to complete and send this application.`}
        showDownloadLink
        buttonText="Close tab"
        onButtonClick={() => window.close()}
        altButtonText="Start a new application"
        onAltButtonClick={() => location.reload()}
      ></StatusPage>
    </>
  );
};

const SaveError: React.FC = () => {
  return (
    <StatusPage
      bannerHeading="Error sending email"
      bannerText="We are having trouble sending emails at the moment."
      cardText="Your application has been saved. We will try to send the email again later."
      showDownloadLink
    ></StatusPage>
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
    [Status.Sending]: (
      <DelayedLoadingIndicator text={"Sending..."} msDelayBeforeVisible={0} />
    ),
    [Status.Success]: (
      <SaveSuccess saveToEmail={saveToEmail} expiryDate={expiryDate} />
    ),
    [Status.Error]: <SaveError />,
  }[pageStatus];
};

export default SavePage;
