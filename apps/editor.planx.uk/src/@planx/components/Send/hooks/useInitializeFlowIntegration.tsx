import { SubmissionEmailInput } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";
import { useEffect } from "react";

import { useInsertFlowIntegration } from "./useInsertFlowIntegrations";

export const useInitializeFlowIntegration = ({
  emailId,
  defaultEmail,
  flowId,
  teamId,
}: {
  emailId: string | undefined;
  defaultEmail: SubmissionEmailInput | undefined;
  flowId: string;
  teamId: number;
}) => {
  const [insertFlowIntegration] = useInsertFlowIntegration();

  useEffect(() => {
    const populateDefaultEmail = async () => {
      if (!emailId && defaultEmail) {
        await insertFlowIntegration({
          variables: {
            flowId,
            emailId: defaultEmail.id!,
            teamId,
          },
        });
      }
    };

    populateDefaultEmail();
  }, [emailId, defaultEmail, flowId, teamId, insertFlowIntegration]);
};
