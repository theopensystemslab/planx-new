import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { darken, useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_THEME, UPDATE_TEAM_THEME } from "../shared/queries";
import { DesignPreview } from "../shared/styles";
import type { GetTeamTheme } from "../shared/types";
import { defaultValues, validationSchema } from "../shared/validationSchema";
import type { FormValues, MutationVars } from "./types";

const ButtonColour: React.FC = () => {
  const teamId = useStore((state) => state.teamId);
  const muiTheme = useTheme();

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
          action_colour: theme.actionColour,
        },
      })}
      validationSchema={validationSchema.pick(["actionColour"])}
      legend="Button colour"
      preview={(formik) => [
        <DesignPreview bgcolor="white">
          <Button
            variant="contained"
            sx={{
              backgroundColor: formik.values.actionColour,
              color: formik.values.actionColour
                ? getContrastTextColor(formik.values.actionColour, "#FFF")
                : "#FFF",
              "&:hover": {
                backgroundColor: formik.values.actionColour
                  ? darken(formik.values.actionColour, 0.2)
                  : muiTheme.palette.prompt.dark,
              },
            }}
          >
            Example primary button
          </Button>
        </DesignPreview>,
      ]}
      description={
        <>
          <p>
            The button background colour should be either a dark or light
            colour. The text will be programmatically selected to contrast with
            the selected colour (being either black or white).
          </p>
          <p>
            <Link
              href="https://opensystemslab.notion.site/10-Customise-the-appearance-of-your-services-3811fe9707534f6cbc0921fc44a2b193"
              target="_blank"
              rel="noopener noreferrer"
            >
              See our guide for setting button colours
            </Link>
          </p>
        </>
      }
    >
      {({ formik }) => (
        <>
          <InputRow>
            <InputRowItem>
              <ColorPicker
                color={formik.values.actionColour}
                inline
                onChange={(color) =>
                  formik.setFieldValue("actionColour", color)
                }
                label="Button colour"
                errorMessage={formik.errors.actionColour}
              />
            </InputRowItem>
          </InputRow>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default ButtonColour;
