import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_ABOUT_FLOW, UPDATE_ABOUT_FLOW } from "../queries";
import type { GetAboutFlow, UpdateAboutFlow } from "../types";
import { defaultValues, validationSchema } from "../validationSchema";

const Limitations: React.FC = () => {
  const [flowId, teamSlug, canUserEditTeam] = useStore((state) => [
    state.id,
    state.teamSlug,
    state.canUserEditTeam,
  ]);
  const isDisabled = !canUserEditTeam(teamSlug);

  return (
    <SettingsFormContainer<
      GetAboutFlow,
      UpdateAboutFlow,
      { limitations: string }
    >
      query={GET_ABOUT_FLOW}
      mutation={UPDATE_ABOUT_FLOW}
      validationSchema={validationSchema.pick(["limitations"])}
      legend={"Service limitations"}
      description={
        <>
          Describe what the service does not cover. This is not shown to users
          on the Local Planning Services website, but it may be publicly visible
          elsewhere.
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flow: { limitations } }) => ({
        limitations: limitations ?? "",
      })}
      queryVariables={{ flowId }}
      getMutationVariables={(flow) => ({ flowId, flow })}
    >
      {({ formik }) => (
        <InputLabel
          label="Limitations"
          htmlFor="limitations"
          id="limitations-label"
        >
          <RichTextInput
            disabled={isDisabled}
            inputProps={{
              "aria-describedby": "limitations-description-text",
              "aria-labelledby": "limitations-label",
            }}
            {...formik.getFieldProps("limitations")}
            id="limitations"
            errorMessage={formik.errors.limitations}
            placeholder="Limitations"
            multiline
            rows={6}
          />
        </InputLabel>
      )}
    </SettingsFormContainer>
  );
};

export default Limitations;
