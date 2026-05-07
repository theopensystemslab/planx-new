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

const EmailTemplateForm: React.FC = () => {
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
      description="Choose the email template category for notifications sent to users of this service. Use 'Application' for statutory planning services and 'General' for discretionary services."
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
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <DescriptionRadio
            data={{
              text: "Application",
              description:
                "Uses 'application' language, suitable for statutory planning services",
            }}
            onChange={(e) =>
              formik.setFieldValue("emailTemplate", e.target.value)
            }
            id="application"
          />
          <DescriptionRadio
            data={{
              text: "General",
              description:
                "Uses 'submission' language, suitable for discretionary services",
            }}
            onChange={(e) =>
              formik.setFieldValue("emailTemplate", e.target.value)
            }
            id="general"
          />
        </RadioGroup>
      )}
    </SettingsFormContainer>
  );
};

export default EmailTemplateForm;
