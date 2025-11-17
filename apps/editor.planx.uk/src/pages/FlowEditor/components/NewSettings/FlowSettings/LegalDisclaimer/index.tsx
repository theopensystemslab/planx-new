import { getIn } from "formik";
import { useToast } from "hooks/useToast";
import { merge } from "lodash";
import { TextInput } from "pages/FlowEditor/components/Settings/ServiceSettings/FlowElements/components/TextInput";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { TextContent } from "types";

import SettingsFormContainer from "../../shared/SettingsForm";
import { GET_FLOW_SETTINGS, UPDATE_FLOW_SETTINGS } from "../shared/queries";
import { textContentValidationSchema } from "../shared/schema";
import type { GetFlowSettings, UpdateFlowSettings } from "../shared/types";
import { defaultValues } from "./schema";

const LegalDisclaimer: React.FC = () => {
  const [flowId, flowStatus] = useStore((state) => [
    state.id,
    state.flowStatus,
  ]);
  const toast = useToast();

  return (
    <SettingsFormContainer<GetFlowSettings, UpdateFlowSettings, TextContent>
      query={GET_FLOW_SETTINGS}
      mutation={UPDATE_FLOW_SETTINGS}
      validationSchema={textContentValidationSchema}
      legend="Legal disclaimer"
      description="Displayed on the 'Result' pages of the service (if it contains any)"
      defaultValues={defaultValues}
      getInitialValues={({
        flow: {
          settings: { elements },
        },
      }) => elements.legalDisclaimer}
      queryVariables={{ flowId }}
      getMutationVariables={(values, data) => ({
        flowId,
        settings: merge({}, data.flow.settings, {
          elements: { legalDisclaimer: values },
        }),
      })}
    >
      {({ formik }) => (
        <TextInput
          title="Legal disclaimer"
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

export default LegalDisclaimer;
