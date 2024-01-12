import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FormikProps, getIn } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import EditorRow from "ui/editor/EditorRow";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { ButtonForm } from "./ButtonForm";
import { FaviconForm } from "./FaviconFrom";
import { TextLinkForm } from "./TextLinkForm";
import { ThemeAndLogoForm } from "./ThemeAndLogoForm";

export const DesignPreview = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.border.input}`,
  padding: theme.spacing(2),
  boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
}));

export const EXAMPLE_COLOUR = "#007078";

type SettingsFormProps = {
  legend: string;
  description: React.ReactElement;
  input: React.ReactElement;
  formik: FormikProps<any>;
  preview?: React.ReactElement;
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  formik,
  legend,
  description,
  input,
  preview,
}) => {
  return (
    <EditorRow background>
      <form onSubmit={formik.handleSubmit}>
        <InputGroup flowSpacing>
          <InputLegend>{legend}</InputLegend>
          {description}
          {input}
        </InputGroup>
        {preview && (
          <Box>
            <Typography variant="h4" my={1}>
              Preview:
            </Typography>
            {preview}
          </Box>
        )}
        <ErrorWrapper error={getIn(formik.errors, "primaryColour")} id="design-settings-theme-error">
          <Box>
            <Button type="submit" variant="contained" disabled={!formik.dirty}>
              Save
            </Button>
            <Button
              onClick={() => formik.resetForm()}
              type="reset"
              variant="contained"
              disabled={!formik.dirty}
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </ErrorWrapper>
      </form>
    </EditorRow>
  );
};

const DesignSettings: React.FC = () => {
  const isUsingFeatureFlag = hasFeatureFlag("SHOW_TEAM_SETTINGS");

  return (
    <>
      <EditorRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Design
        </Typography>
        <Typography variant="body1">
          How your service appears to public users
        </Typography>
      </EditorRow>
      {!isUsingFeatureFlag ? (
        <EditorRow>
          <FeaturePlaceholder title="Feature in development" />{" "}
        </EditorRow>
      ) : (
        <>
          <ThemeAndLogoForm />
          <ButtonForm />
          <TextLinkForm />
          <FaviconForm />
        </>
      )}
    </>
  );
};

export default DesignSettings;
