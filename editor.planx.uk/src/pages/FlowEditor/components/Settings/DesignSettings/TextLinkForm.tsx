import Link from "@mui/material/Link";
import { getContrastRatio, useTheme } from "@mui/material/styles";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { DesignPreview, FormProps, SettingsForm } from ".";

export const TextLinkForm: React.FC<FormProps> = ({
  formikConfig,
  onSuccess,
}) => {
  const theme = useTheme();

  const formik = useFormik<TeamTheme>({
    ...formikConfig,
    validate: ({ linkColour }) => {
      const isContrastThresholdMet =
        getContrastRatio("#FFF", linkColour) > theme.palette.contrastThreshold;

      if (!isContrastThresholdMet) {
        return {
          linkColour:
            "Colour does not meet accessibility contrast requirements (3:1)",
        };
      }
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamTheme({
        linkColour: values.linkColour,
      });
      if (isSuccess) {
        onSuccess();
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
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
            <Link href="#">
              See our guide for setting text link colours (TODO)
            </Link>
          </InputDescription>
        </>
      }
      input={
        <InputRow>
          <InputRowItem>
            <ColorPicker
              color={formik.values.linkColour}
              onChange={(color) => formik.setFieldValue("linkColour", color)}
              label="Text link colour"
            />
          </InputRowItem>
        </InputRow>
      }
      preview={
        <DesignPreview bgcolor="white">
          <Link sx={{ color: formik.values.linkColour }}>
            Example text link
          </Link>
        </DesignPreview>
      }
    />
  );
};
