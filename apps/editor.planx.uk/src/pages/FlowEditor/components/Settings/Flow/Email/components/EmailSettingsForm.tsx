import RadioGroup from "@mui/material/RadioGroup";
import DescriptionRadio from "@planx/components/shared/Radio/DescriptionRadio/DescriptionRadio";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_FLOW_EMAIL_TEMPLATE,
  UPDATE_FLOW_EMAIL_TEMPLATE,
} from "../queries";
import type {
  FormValues,
  GetFlowEmailTemplate,
  UpdateFlowEmailTemplate,
} from "../types";
import { defaultValues, validationSchema } from "../validationSchema";

const EmailSettingsForm: React.FC = () => {
  const [flowId] = useStore((state) => [state.id]);

  return (
    <SettingsFormContainer<
      GetFlowEmailTemplate,
      UpdateFlowEmailTemplate,
      FormValues
    >
      query={GET_FLOW_EMAIL_TEMPLATE}
      mutation={UPDATE_FLOW_EMAIL_TEMPLATE}
      validationSchema={validationSchema}
      legend="Email template"
      description="Choose an email template to communicate with users of this service. We use GOV.UK Notify to send these."
      defaultValues={defaultValues}
      getInitialValues={({ flow }) => ({
        emailTemplate: flow.email_template,
      })}
      queryVariables={{ flowId }}
      getMutationVariables={({ emailTemplate }) => ({
        flowId,
        emailTemplate,
      })}
    >
      {({ formik }) => (
        <RadioGroup
          aria-label="Email template category"
          value={formik.values.emailTemplate}
          onChange={(e) =>
            formik.setFieldValue("emailTemplate", e.target.value)
          }
        >
          <DescriptionRadio
            data={{
              text: "Application",
              description:
                "Best for statutory planning applications and pre-application advice services. Uses planning and application specific language.",
            }}
            onChange={(e) =>
              formik.setFieldValue("emailTemplate", e.target.value)
            }
            variant="compact"
            id="application"
          />
          <DescriptionRadio
            data={{
              text: "Submission",
              description:
                "Best for other services such as submissions of notices, reports and requests. Uses neutral submission language.",
            }}
            onChange={(e) =>
              formik.setFieldValue("emailTemplate", e.target.value)
            }
            variant="compact"
            id="general"
          />
        </RadioGroup>
      )}
    </SettingsFormContainer>
  );
};

export default EmailSettingsForm;
