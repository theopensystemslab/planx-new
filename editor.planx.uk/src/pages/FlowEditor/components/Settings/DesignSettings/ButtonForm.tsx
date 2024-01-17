import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { DesignPreview, EXAMPLE_COLOUR, SettingsForm } from ".";

export const ButtonForm: React.FC = () => {
  const formik = useFormik<{
    buttonColor: string;
  }>({
    initialValues: {
      buttonColor: EXAMPLE_COLOUR,
    },
    onSubmit: () => {},
    validate: () => {},
  });

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
              color={formik.values.buttonColor}
              onChange={(color) => formik.setFieldValue("buttonColor", color)}
              label="Button colour"
            />
          </InputRowItem>
        </InputRow>
      }
      preview={
        <DesignPreview bgcolor="white">
          <Button variant="contained" sx={{ backgroundColor: EXAMPLE_COLOUR }}>
            Example primary button
          </Button>
        </DesignPreview>
      }
    />
  );
};
