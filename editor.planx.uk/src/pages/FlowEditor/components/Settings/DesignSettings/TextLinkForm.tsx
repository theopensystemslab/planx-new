import Link from "@mui/material/Link";
import { getContrastRatio, useTheme } from "@mui/material/styles";
import { Team, TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputDescription from "ui/editor/InputDescription";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { DesignPreview, SettingsForm } from ".";

type FormValues = Pick<TeamTheme, "linkColour">;

export const TextLinkForm: React.FC<{ team: Team; onSuccess: () => void }> = ({
  team,
  onSuccess,
}) => {
  const theme = useTheme();

  useEffect(() => {
    setInitialValues({ linkColour: team.theme?.linkColour });
  }, [team]);

  const [initialValues, setInitialValues] = useState<FormValues>({
    linkColour: "",
  });

  const formik = useFormik<FormValues>({
    initialValues,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamTheme(values);
      if (isSuccess) {
        onSuccess();
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    enableReinitialize: true,
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
