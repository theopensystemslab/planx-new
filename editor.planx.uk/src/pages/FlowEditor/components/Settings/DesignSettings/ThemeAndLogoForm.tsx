import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import PublicFileUploadButton from "ui/shared/PublicFileUploadButton";

import { DesignPreview, EXAMPLE_COLOUR, SettingsForm } from ".";

export const ThemeAndLogoForm: React.FC = () => {
  const formik = useFormik<{
    themeColor: string;
  }>({
    initialValues: {
      themeColor: EXAMPLE_COLOUR,
    },
    onSubmit: () => {},
    validate: () => {},
  });

  return (
    <SettingsForm
      formik={formik}
      legend="Theme colour & logo"
      description={
        <>
          <InputDescription>
            The theme colour and logo, are used in the header of the service.
            The theme colour should be a dark colour that contrasts with white
            ("#ffffff"). The logo should contrast with a dark background colour
            (your theme colour) and have a transparent background.
          </InputDescription>
          <InputDescription>
            <Link href="https://www.planx.uk">
              See our guide for setting theme colours and logos
            </Link>
          </InputDescription>
        </>
      }
      input={
        <>
          <InputRow>
            <InputRowItem>
              <ColorPicker
                color={formik.values.themeColor}
                onChange={(color) => formik.setFieldValue("themeColor", color)}
                label="Theme colour"
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowLabel>Logo:</InputRowLabel>
            <InputRowItem width={50}>
              <PublicFileUploadButton />
            </InputRowItem>
            <Typography
              color="text.secondary"
              variant="body2"
              pl={2}
              alignSelf="center"
            >
              .png or .svg
            </Typography>
          </InputRow>
        </>
      }
      preview={
        <DesignPreview bgcolor={EXAMPLE_COLOUR}>
          <img
            width="140"
            src="https://raw.githubusercontent.com/theopensystemslab/planx-team-logos/main/barnet.svg"
            alt="council logo"
          />
        </DesignPreview>
      }
    />
  );
};
