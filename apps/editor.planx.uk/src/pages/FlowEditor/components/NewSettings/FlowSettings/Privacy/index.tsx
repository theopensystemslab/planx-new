import { getIn } from "formik";
import { useToast } from "hooks/useToast";
import { merge } from "lodash";
import { TextInput } from "pages/FlowEditor/components/Settings/ServiceSettings/FlowElements/components/TextInput";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { TextContent } from "types";

import SettingsFormContainer from "../../shared/SettingsForm";
import { GET_FLOW_SETTINGS, UPDATE_FLOW_SETTINGS } from "../shared/queries";
import type { GetFlowSettings, UpdateFlowSettings } from "../shared/types";
import { defaultValues, validationSchema } from "./schema";

const Privacy: React.FC = () => {
  const [flowId, flowStatus] = useStore((state) => [
    state.id,
    state.flowStatus,
  ]);
  const toast = useToast();

  return (
    <SettingsFormContainer<GetFlowSettings, UpdateFlowSettings, TextContent>
      query={GET_FLOW_SETTINGS}
      mutation={UPDATE_FLOW_SETTINGS}
      validationSchema={validationSchema}
      legend={"Privacy page"}
      description={
        "Your privacy policy. If you use the template notice, update the placeholders with your council's information."
      }
      defaultValues={defaultValues}
      getInitialValues={({
        flow: {
          settings: { elements },
        },
      }) => elements.privacy}
      queryVariables={{ flowId }}
      getMutationVariables={(values, data) => ({
        flowId,
        settings: merge({}, data.flow.settings, {
          elements: { privacy: values },
        }),
      })}
    >
      {({ formik }) => (
        <TextInput
          title="Privacy page"
          richText
          switchProps={{
            name: "show",
            checked: formik.values.show,
            onChange: (e) => {
              if (flowStatus === "online" && formik.values.show) {
                toast.error(
                  "You cannot disable the privacy page for a service that is online",
                );
                return;
              }
              formik.handleChange(e);
            },
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

export default Privacy;
