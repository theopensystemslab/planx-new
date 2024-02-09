import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { FormikConfig, FormikProps } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import EditorRow from "ui/editor/EditorRow";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { ButtonForm } from "./ButtonForm";
import { FaviconForm } from "./FaviconForm";
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
  formik: FormikProps<TeamTheme>;
  preview?: React.ReactElement;
};

export interface FormProps {
  formikConfig: FormikConfig<TeamTheme>;
  onSuccess: () => void;
}

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
        <ErrorWrapper
          error={Object.values(formik.errors).join(", ")}
          id="design-settings-theme-error"
        >
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
  const [formikConfig, setFormikConfig] = useState<
    FormikConfig<TeamTheme> | undefined
  >(undefined);

  /**
   * Fetch current team and setup shared form config
   */
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const fetchedTeam = await useStore.getState().fetchCurrentTeam();
        if (!fetchedTeam) throw Error("Unable to find team");

        setFormikConfig({
          initialValues: fetchedTeam.theme,
          // This value will be set per form section
          onSubmit: () => {},
          validateOnBlur: false,
          validateOnChange: false,
          enableReinitialize: true,
        });
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };

    fetchTeam();
  }, []);

  const [open, setOpen] = useState(false);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const onSuccess = () => setOpen(true);

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
      {formikConfig && (
        <>
          <ThemeAndLogoForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <ButtonForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <TextLinkForm formikConfig={formikConfig} onSuccess={onSuccess} />
          <FaviconForm formikConfig={formikConfig} onSuccess={onSuccess} />
        </>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Theme updated successfully
        </Alert>
      </Snackbar>
    </>
  );
};

export default DesignSettings;
