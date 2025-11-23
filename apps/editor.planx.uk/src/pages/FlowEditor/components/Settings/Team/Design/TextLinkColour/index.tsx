import Link from "@mui/material/Link";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_THEME, UPDATE_TEAM_THEME } from "../shared/queries";
import { DesignPreview } from "../shared/styles";
import type { GetTeamTheme } from "../shared/types";
import { defaultValues, validationSchema } from "../shared/validationSchema";
import type { FormValues, MutationVars } from "./types";

const TextLinkColour: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  return (
    <SettingsFormContainer<GetTeamTheme, MutationVars, FormValues>
      query={GET_TEAM_THEME}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPDATE_TEAM_THEME}
      getInitialValues={({ themes: [theme] }) => theme}
      getMutationVariables={(theme) => ({
        teamId,
        theme: {
          link_colour: theme.linkColour,
        },
      })}
      validationSchema={validationSchema.pick(["linkColour"])}
      legend="Text link colour"
      preview={(formik) => [
        <DesignPreview bgcolor="white">
          <Link sx={{ color: formik.values.linkColour }}>
            Example text link
          </Link>
        </DesignPreview>,
      ]}
      description={
        <>
          <p>
            The text link colour should be a dark colour that contrasts with
            white ("#ffffff").
          </p>
          <p>
            <Link
              href="https://opensystemslab.notion.site/10-Customise-the-appearance-of-your-services-3811fe9707534f6cbc0921fc44a2b193"
              target="_blank"
              rel="noopener noreferrer"
            >
              See our guide for setting text link colours
            </Link>
          </p>
        </>
      }
    >
      {({ formik }) => (
        <InputRow>
          <InputRowItem>
            <ColorPicker
              color={formik.values.linkColour}
              inline
              onChange={(color) => formik.setFieldValue("linkColour", color)}
              label="Text link colour"
              errorMessage={formik.errors.linkColour}
            />
          </InputRowItem>
        </InputRow>
      )}
    </SettingsFormContainer>
  );
};

export default TextLinkColour;
