import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React from "react";
import EditorRow from "ui/editor/EditorRow";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import ErrorWrapper from "ui/shared/ErrorWrapper";

interface NewSettingsProps {
  legend: string;
  description: React.ReactElement;
  input: React.ReactElement;
}

export const NewSettingsForm: React.FC<NewSettingsProps> = ({
  legend,
  description,
  input,
}) => {
  return (
    <EditorRow background>
      <form>
        <InputLegend>{legend}</InputLegend>
        {description}
        <InputGroup flowSpacing label="Boundary URL">
          {input}
        </InputGroup>
        <ErrorWrapper error={"error"} id="design-settings-theme-error">
          <Box>
            <Button type="submit" variant="contained">
              Save
            </Button>
            <Button
              type="reset"
              variant="contained"
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
