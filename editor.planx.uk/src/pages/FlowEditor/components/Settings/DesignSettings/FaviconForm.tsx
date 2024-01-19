import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Team, TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import ImgInput from "ui/editor/ImgInput";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from ".";

type FormValues = Pick<TeamTheme, "favicon">;

export const FaviconForm: React.FC<{ team: Team, onSuccess: () => void }> = ({ team, onSuccess }) => {
  useEffect(() => {
    setInitialValues({ favicon: team.theme?.favicon || "" });
  }, [team]);

  const [initialValues, setInitialValues] = useState<FormValues>({
    favicon: "",
  });

  const formik = useFormik<FormValues>({
    initialValues,
    validateOnBlur: false,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamTheme(values);
      if (isSuccess) {
        onSuccess();
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  const updateFavicon = (newFile: string | undefined) => newFile 
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
            <Link href="https://www.planx.uk">See our guide for favicons</Link>
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
