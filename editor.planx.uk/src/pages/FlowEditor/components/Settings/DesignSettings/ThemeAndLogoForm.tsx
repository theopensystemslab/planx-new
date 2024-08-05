import Link from "@mui/material/Link";
import { getContrastRatio, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import ImgInput from "ui/editor/ImgInput";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from "../shared/SettingsForm";
import { DesignPreview, FormProps } from ".";

export const ThemeAndLogoForm: React.FC<FormProps> = ({
  formikConfig,
  onSuccess,
}) => {
  const theme = useTheme();
  const teamSlug = useStore((state) => state.teamSlug);

  const formik = useFormik<TeamTheme>({
    ...formikConfig,
    validate: ({ primaryColour }) => {
      const isContrastThresholdMet =
        getContrastRatio("#FFF", primaryColour) >
        theme.palette.contrastThreshold;

      if (!isContrastThresholdMet) {
        return {
          primaryColour:
            "Theme colour does not meet accessibility contrast requirements (3:1)",
        };
      }
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamTheme({
        primaryColour: values.primaryColour,
        logo: values.logo,
      });
      if (isSuccess) {
        onSuccess();
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  const updateLogo = (newFile: string | undefined) =>
    newFile
      ? formik.setFieldValue("logo", newFile)
      : formik.setFieldValue("logo", null);

  return (
    <SettingsForm<TeamTheme>
      formik={formik}
      legend="Theme colour & logo"
      description={
        <>
          <p>
            The theme colour and logo, are used in the header of the service.
            The theme colour should be a dark colour that contrasts with white
            ("#ffffff"). The logo should contrast with a dark background colour
            (your theme colour) and have a transparent background.
          </p>
          <p>
            <Link
              href="https://opensystemslab.notion.site/10-Customise-the-appearance-of-your-services-3811fe9707534f6cbc0921fc44a2b193"
              target="_blank"
              rel="noopener noreferrer"
            >
              See our guide for setting theme colours and logos
            </Link>
          </p>
        </>
      }
      input={
        <>
          <InputRow>
            <InputRowItem>
              <ColorPicker
                color={formik.values.primaryColour}
                inline
                onChange={(color) =>
                  formik.setFieldValue("primaryColour", color)
                }
                label="Theme colour"
                errorMessage={formik.errors.primaryColour}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowLabel>Logo:</InputRowLabel>
            <InputRowItem width={formik.values.logo ? 90 : 50}>
              <ImgInput
                backgroundColor={formik.values.primaryColour}
                img={formik.values.logo || undefined}
                onChange={updateLogo}
                acceptedFileTypes={{
                  "image/png": [".png"],
                  "image/svg+xml": [".svg"],
                }}
              />
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
        <DesignPreview bgcolor={formik.values.primaryColour}>
          {formik.values.logo ? (
            <img width="140" src={formik.values.logo} alt="council logo" />
          ) : (
            <Typography color={theme.palette.primary.contrastText}>
              Plan✕ / {teamSlug}
            </Typography>
          )}
        </DesignPreview>
      }
    />
  );
};
