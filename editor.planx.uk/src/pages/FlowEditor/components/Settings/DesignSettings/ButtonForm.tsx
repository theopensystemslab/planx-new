import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { darken, useTheme } from "@mui/material/styles";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { SettingsForm } from "../shared/SettingsForm";
import { DesignPreview, FormProps } from ".";

export const ButtonForm: React.FC<FormProps> = ({
  formikConfig,
  onSuccess,
}) => {
  const theme = useTheme();
  const formik = useFormik<TeamTheme>({
    ...formikConfig,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamTheme({
        actionColour: values.actionColour,
      });
      if (isSuccess) {
        onSuccess();
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  return (
    <SettingsForm<TeamTheme>
      formik={formik}
      legend="Button colour"
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
      input={
        <InputRow>
          <InputRowItem>
            <ColorPicker
              color={formik.values.actionColour}
              inline
              onChange={(color) => formik.setFieldValue("actionColour", color)}
              label="Button colour"
              errorMessage={formik.errors.actionColour}
            />
          </InputRowItem>
        </InputRow>
      }
      preview={
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
                  : theme.palette.prompt.dark,
              },
            }}
          >
            Example primary button
          </Button>
        </DesignPreview>
      }
    />
  );
};
