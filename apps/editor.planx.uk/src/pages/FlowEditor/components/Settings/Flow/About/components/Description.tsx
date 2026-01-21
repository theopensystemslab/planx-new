import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_ABOUT_FLOW, UPDATE_ABOUT_FLOW } from "../queries";
import type { GetAboutFlow, UpdateAboutFlow } from "../types";
import { defaultValues, validationSchema } from "../validationSchema";

const Description: React.FC = () => {
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
      { description: string }
    >
      query={GET_ABOUT_FLOW}
      mutation={UPDATE_ABOUT_FLOW}
      validationSchema={validationSchema.pick(["description"])}
      legend={"Service description"}
      description={
        <>
          Describe the service in more detail.
          <br />
          <br /> Include who it's aimed at and what it does. This is not shown
          to users on the Local Planning Services website, but it may be
          publicly visible elsewhere.
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flow: { description } }) => ({
        description: description ?? "",
      })}
      queryVariables={{ flowId }}
      getMutationVariables={(flow) => ({ flowId, flow })}
    >
      {({ formik }) => (
        <InputLabel
          label="Description"
          htmlFor="description"
          id="description-label"
        >
          <RichTextInput
            {...formik.getFieldProps("description")}
            disabled={isDisabled}
            inputProps={{
              "aria-describedby": "description-description-text",
              "aria-labelledby": "description-label",
            }}
            id="description"
            placeholder="The service..."
            multiline
            rows={6}
            errorMessage={formik.errors.description}
          />
        </InputLabel>
      )}
    </SettingsFormContainer>
  );
};

export default Description;
