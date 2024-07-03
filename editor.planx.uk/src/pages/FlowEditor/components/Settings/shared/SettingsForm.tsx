import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FormikProps } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import ErrorWrapper from "ui/shared/ErrorWrapper";

type SettingsFormProps<TFormikValues> = {
  legend: string;
  description: React.ReactElement;
  input: React.ReactElement;
  formik: FormikProps<TFormikValues>;
  preview?: React.ReactElement;
  isErrors?: boolean;
};

export const SettingsForm = <TFormikValues,>({
  formik,
  legend,
  description,
  input,
  preview,
  isErrors,
}: SettingsFormProps<TFormikValues>) => {
  // By default, errors is set to true
  isErrors === undefined ? (isErrors = true) : false;
  return (
    <SettingsSection background>
      <form onSubmit={formik.handleSubmit}>
        <InputGroup flowSpacing>
          <InputLegend>{legend}</InputLegend>
          <SettingsDescription>{description}</SettingsDescription>
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
        {isErrors ? (
          <ErrorWrapper
            error={Object.values(formik.errors).join(", ")}
            id="settings-error"
          >
            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={!formik.dirty}
              >
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
        ) : (
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
        )}
      </form>
    </SettingsSection>
  );
};
