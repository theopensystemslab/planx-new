import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ImgInput from "ui/editor/ImgInput";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { FormProps, SettingsForm } from ".";

export const FaviconForm: React.FC<FormProps> = ({
  formikConfig,
  onSuccess,
}) => {
  const formik = useFormik<TeamTheme>({
    ...formikConfig,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamTheme({
        favicon: values.favicon,
      });
      if (isSuccess) {
        onSuccess();
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  const updateFavicon = (newFile: string | undefined) =>
    newFile
      ? formik.setFieldValue("favicon", newFile)
      : formik.setFieldValue("favicon", null);

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
            <Link
              href="https://opensystemslab.notion.site/10-Customise-the-appearance-of-your-services-3811fe9707534f6cbc0921fc44a2b193"
              target="_blank"
              rel="noopener noreferrer"
            >
              See our guide for favicons
            </Link>
          </InputDescription>
        </>
      }
      input={
        <InputRow>
          <InputRowLabel>Favicon:</InputRowLabel>
          <InputRowItem width={formik.values.favicon ? 90 : 50}>
            <ImgInput
              img={formik.values.favicon || undefined}
              onChange={updateFavicon}
              acceptedFileTypes={{
                "image/png": [".png"],
                "image/x-icon": [".ico"],
                "image/vnd.microsoft.icon": [".ico"],
              }}
            />
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
