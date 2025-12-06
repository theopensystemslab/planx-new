import { getIn } from "formik";
import { merge } from "lodash";
import { TextInput } from "pages/FlowEditor/components/Settings/shared/TextInput";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { TextContent } from "types";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_FLOW_SETTINGS, UPDATE_FLOW_SETTINGS } from "../../shared/queries";
import { textContentValidationSchema } from "../../shared/schema";
import {
  type GetFlowSettings,
  type UpdateFlowSettings,
} from "../../shared/types";
import { defaultValues } from "./../schema";

const DEFAULT_GUIDANCE_DISCLAIMER = {
  show: true,
  heading: "For guidance only",
  content:
    "Please note that this service is provided for guidance only and does not represent a planning decision or legal advice.",
};

const GuidanceDisclaimer: React.FC = () => {
  const flowId = useStore((state) => state.id);

  return (
    <SettingsFormContainer<GetFlowSettings, UpdateFlowSettings, TextContent>
      query={GET_FLOW_SETTINGS}
      mutation={UPDATE_FLOW_SETTINGS}
      validationSchema={textContentValidationSchema}
      legend="Guidance disclaimer"
      description="Displayed on the entry page of all online, published, non-submission services below the service name and summary."
      defaultValues={defaultValues}
      getInitialValues={({ flow: { settings } }) =>
        settings?.elements?.guidanceDisclaimer || DEFAULT_GUIDANCE_DISCLAIMER
      }
      queryVariables={{ flowId }}
      getMutationVariables={(values, data) => ({
        flowId,
        settings: merge({}, data.flow.settings, {
          elements: { guidanceDisclaimer: values },
        }),
      })}
    >
      {({ formik }) => (
        <TextInput
          title="Guidance disclaimer"
          richText
          switchProps={{
            name: "show",
            checked: formik.values.show,
            onChange: formik.handleChange,
          }}
          headingInputProps={{
            name: "heading",
            value: formik.values.heading,
            onChange: formik.handleChange,
            errorMessage: getIn(formik.errors, "heading"),
          }}
          contentInputProps={{
            name: "content",
            value: formik.values.content,
            onChange: formik.handleChange,
            errorMessage: getIn(formik.errors, "content"),
          }}
        />
      )}
    </SettingsFormContainer>
  );
};

export default GuidanceDisclaimer;
