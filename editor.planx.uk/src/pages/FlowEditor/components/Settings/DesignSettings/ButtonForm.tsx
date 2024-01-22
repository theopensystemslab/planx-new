import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { darken, useTheme } from "@mui/material/styles";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ColorPicker from "ui/editor/ColorPicker";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { DesignPreview, FormProps, SettingsForm } from ".";
export const ButtonForm: React.FC<FormProps> = ({ formikConfig }) => {
  const theme = useTheme();
  const formik = useFormik<TeamTheme>(formikConfig);

  return (
    <SettingsForm
      formik={formik}
      legend="Button colour"
      description={
        <>
          <InputDescription>
            The button background colour should be either a dark or light
            colour. The text will be programmatically selected to contrast with
            the selected colour (being either black or white).
          </InputDescription>
          <InputDescription>
            <Link href="https://www.planx.uk">
              See our guide for setting button colours
            </Link>
          </InputDescription>
        </>
      }
      input={
        <InputRow>
          <InputRowItem>
            <ColorPicker
              color={formik.values.actionColour}
              onChange={(color) => formik.setFieldValue("actionColour", color)}
              label="Button colour"
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
