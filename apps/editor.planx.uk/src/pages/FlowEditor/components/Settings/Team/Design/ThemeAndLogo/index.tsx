import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_THEME, UPDATE_TEAM_THEME } from "../shared/queries";
import { DesignPreview } from "../shared/styles";
import type { GetTeamTheme } from "../shared/types";
import { defaultValues, validationSchema } from "../shared/validationSchema";
import type { FormValues, MutationVars } from "./types";

const ThemeAndLogo: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);
  const muiTheme = useTheme();

  return (
    <SettingsFormContainer<GetTeamTheme, MutationVars, FormValues>
      query={GET_TEAM_THEME}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPDATE_TEAM_THEME}
      getInitialValues={({ themes: [theme] }) => theme}
      getMutationVariables={(theme) => ({
        teamId,
        theme: {
          primary_colour: theme.primaryColour,
          logo: theme.logo,
        },
      })}
      validationSchema={validationSchema.pick(["logo", "primaryColour"])}
      legend="Theme colour & logo"
      preview={(formik) => [
        <DesignPreview bgcolor={formik.values.primaryColour}>
          {formik.values.logo ? (
            <img width="140" src={formik.values.logo} alt="council logo" />
          ) : (
            <Typography color={muiTheme.palette.primary.contrastText}>
              Plan✕ / {teamSlug}
            </Typography>
          )}
        </DesignPreview>,
      ]}
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
    >
      {({ formik }) => (
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
                onChange={(newFile) =>
                  newFile
                    ? formik.setFieldValue("logo", newFile)
                    : formik.setFieldValue("logo", null)
                }
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
      )}
    </SettingsFormContainer>
  );
};

export default ThemeAndLogo;
