import Link from "@mui/material/Link";
import { getContrastRatio, useTheme } from "@mui/material/styles";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { SettingsForm } from "../shared/SettingsForm";
import { DesignPreview, FormProps } from ".";

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
    <SettingsForm<TeamTheme>
      formik={formik}
      legend="Text link colour"
      description={
        <>
          <p>
            The text link colour should be a dark colour that contrasts with
            white ("#ffffff").
          </p>
          <p>
            <Link
              href="https://opensystemslab.notion.site/10-Customise-the-appearance-of-your-services-3811fe9707534f6cbc0921fc44a2b193"
              target="_blank"
              rel="noopener noreferrer"
            >
              See our guide for setting text link colours
            </Link>
          </p>
        </>
      }
      input={
        <InputRow>
          <InputRowItem>
            <ColorPicker
              color={formik.values.linkColour}
              inline
              onChange={(color) => formik.setFieldValue("linkColour", color)}
              label="Text link colour"
              errorMessage={formik.errors.linkColour}
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
