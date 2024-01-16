import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import PublicFileUploadButton from "ui/shared/PublicFileUploadButton";

import { EXAMPLE_COLOUR, SettingsForm } from ".";

export const FaviconForm: React.FC = () => {
  const formik = useFormik<{
    textLinkColor: string;
  }>({
    initialValues: {
      textLinkColor: EXAMPLE_COLOUR,
    },
    onSubmit: () => {},
    validate: () => {},
  });

  return (
    <SettingsForm
      formik={formik}
      legend="Favicon"
      description={
        <>
          <InputDescription>
            Set the favicon to be used in the browser tab. The favicon should be
            32x32px and in .ico or .png format.
          </InputDescription>
          <InputDescription>
            <Link href="https://www.planx.uk">See our guide for favicons</Link>
          </InputDescription>
        </>
      }
      input={
        <InputRow>
          <InputRowLabel>Favicon:</InputRowLabel>
          <InputRowItem width={50}>
            <PublicFileUploadButton />
          </InputRowItem>
          <Typography
            color="text.secondary"
            variant="body2"
            pl={2}
            alignSelf="center"
          >
            .ico or .png
          </Typography>
        </InputRow>
      }
    />
  );
};
