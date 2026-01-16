import Box from "@mui/material/Box";
import React from "react";
import NewSettingsSection from "ui/editor/NewSettingsSection";

import { EmailsTable } from "./EmailsTable";

export const SubmissionEmails: React.FC = () => {
  return (
    <NewSettingsSection>
      <Box mt={2}>
        <h2>Submission Emails</h2>
        <p>
          Manage the email addresses that will receive submissions. One must
          always be set as a default.
        </p>
        <EmailsTable />
      </Box>
    </NewSettingsSection>
  );
};

export default SubmissionEmails;
