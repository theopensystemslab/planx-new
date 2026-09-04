import Box from "@mui/material/Box";
import NewSettingsSection from "ui/editor/NewSettingsSection";

import { EmailsTable } from "./EmailsTable";

const SubmissionEmails: React.FC = () => {
  return (
    <NewSettingsSection>
      <Box sx={{ mt: 2 }}>
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
