import Link from "@mui/material/Link";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { DesignPreview, EXAMPLE_COLOUR, SettingsForm } from ".";

export const TextLinkForm: React.FC = () => {
  const formik = useFormik<{
    linkColor: string;
  }>({
    initialValues: {
      linkColor: EXAMPLE_COLOUR,
    },
    onSubmit: () => {},
    validate: () => {},
  });

  return (
    <SettingsForm
      formik={formik}
      legend="Text link colour"
      description={
        <>
          <InputDescription>
            The text link colour should be a dark colour that contrasts with
            white ("#ffffff").
          </InputDescription>
          <InputDescription>
            <Link href="https://www.planx.uk">
              See our guide for setting text link colours
            </Link>
          </InputDescription>
        </>
      }
      input={
        <InputRow>
          <InputRowItem>
            <ColorPicker
              color={formik.values.linkColor}
              onChange={(color) => formik.setFieldValue("linkColor", color)}
              label="Text link colour"
            />
          </InputRowItem>
        </InputRow>
      }
      preview={
        <DesignPreview bgcolor="white">
          <Link sx={{ color: EXAMPLE_COLOUR }}>Example text link</Link>
        </DesignPreview>
      }
    />
  );
};
