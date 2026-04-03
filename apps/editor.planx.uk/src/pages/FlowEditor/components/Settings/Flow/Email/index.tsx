import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Box from "@mui/material/Box";
import SettingsFormContainer from "../../shared/SettingsForm";
import { GET_FLOW_EMAIL_TEMPLATE, UPDATE_FLOW_EMAIL_TEMPLATE } from "./queries";
import { defaultValue } from "./schema";

const Email: React.FC = () => {
  const flowId = useStore((state) => state.id);

  return (
    <SettingsFormContainer<
      GetFlowEmailTemplate, 
      UpdateFlowEmailTemplate, 
      EmailTemplateFormValues
    >
      query={GET_FLOW_EMAIL_TEMPLATE}
      mutation={UPDATE_FLOW_EMAIL_TEMPLATE}
      validationSchema={flowEmailValidationSchema}
      legend="Choose your email template language"
      description="PlanX sends emails via GOV.UK Notify for various events like save and return, expiry reminders, invite to pay, and submissions."
      defaultValues={defaultValue}
      getInitialValues={({ flow: { email_template } }) => ({ email_template })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({ flowId, ...values })}
      showActionButtons={false}
    >
      {({ formik, data }) => (
        <Box display="flex" alignItems="center" mb={2}>
          
        </Box>
      )}
    </SettingsFormContainer>
  );
};

export default Email;
