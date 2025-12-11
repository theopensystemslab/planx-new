import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";

import SubmissionEmail from "./SubmissionEmail";
import SubmissionEmails from "./SubmissionEmails";

const IntegrationSettings: React.FC = () => (
  <>
    {hasFeatureFlag("TEAM_SUBMISSION_INTEGRATIONS") && <SubmissionEmails />}
    <SubmissionEmail />
  </>
);

export default IntegrationSettings;
