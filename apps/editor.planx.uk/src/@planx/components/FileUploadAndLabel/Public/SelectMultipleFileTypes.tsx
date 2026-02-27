import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import capitalize from "lodash/capitalize";
import React, { useMemo } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import Input from "ui/shared/Input/Input";

import { FileUploadSlot } from "../../FileUpload/model";
import {
  addOrAppendSlots,
  FileList,
  getTagsForSlot,
  removeSlots,
  UserFile,
} from "../model";

interface ChecklistProps {
  uploadedFile: FileUploadSlot;
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  showDrawingNumber?: boolean;
  drawingNumber?: string;
  onDrawingNumberChange?: (value: string) => void;
  onSave: () => void;
}

interface Option extends UserFile {
  category: keyof FileList;
}

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  borderColor: theme.palette.border.main,
  borderStyle: "solid",
  borderWidth: "0 1px 1px 1px",
  padding: theme.spacing(2),
}));

const ChecklistGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

// Sanitize function to create valid IDs (no spaces)
const sanitizeId = (str: string): string => {
  return str.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
};

export const SelectMultipleFileTypes = (props: ChecklistProps) => {
  const {
    uploadedFile,
    fileList,
    setFileList,
    showDrawingNumber,
    drawingNumber,
    onDrawingNumberChange,
    onSave,
  } = props;

  const initialTags = getTagsForSlot(uploadedFile.id, fileList);

  const titleId = `file-selection-title-${uploadedFile.id}`;

  /**
   * Options for checklist
   * FileList with appended "category" property for grouping
   */
  const options: Option[] = useMemo(
    () =>
      (Object.keys(fileList) as Array<keyof typeof fileList>)
        .filter((fileListCategory) => fileList[fileListCategory].length > 0)
        .flatMap((category) =>
          fileList[category].map((fileType) => ({ category, ...fileType })),
        ),
    [fileList],
  );

  /**
   * Group options by category for rendering
   */
  const groupedOptions = useMemo(
    () => Object.groupBy(options, ({ category }) => category),
    [options],
  );

  /**
   * Handle individual checkbox change
   */
  const handleCheckboxChange = (option: Option) => {
    const isCurrentlyChecked = initialTags.includes(option.name);
    const newCheckedState = !isCurrentlyChecked;

    if (newCheckedState) {
      // Add the tag
      const updatedFileList = addOrAppendSlots(
        [option.name],
        uploadedFile,
        fileList,
      );
      setFileList(updatedFileList);
    } else {
      // Remove the tag
      const updatedFileList = removeSlots(
        [option.name],
        uploadedFile,
        fileList,
      );
      setFileList(updatedFileList);
    }
  };

  return (
    <Root>
      <Typography variant="h3" mb={2} id={titleId}>
        What does this file show? Select all that apply
        <Box component="span" sx={visuallyHidden}>
          This question refers to file: {uploadedFile.file.name}
        </Box>
      </Typography>

      {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
        <FormControl
          key={category}
          component="fieldset"
          sx={{ width: "100%", mb: 1 }}
          aria-describedby={titleId}
        >
          <FormLabel
            component="legend"
            sx={{
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
              color: "text.primary",
            }}
          >
            {capitalize(category)} information
          </FormLabel>

          <ChecklistGrid>
            {categoryOptions.map((option) => (
              <ChecklistItem
                key={`${category}-${option.name}`}
                id={sanitizeId(`${uploadedFile.id}-${category}-${option.name}`)}
                label={option.name}
                checked={initialTags.includes(option.name)}
                onChange={() => handleCheckboxChange(option)}
              />
            ))}
          </ChecklistGrid>
        </FormControl>
      ))}

      {showDrawingNumber && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="h3"
            pb={0.5}
            sx={{ display: "inline-block" }}
            id={`drawing-number-label-${uploadedFile.id}`}
            component="label"
          >
            Drawing number (optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Separate multiple drawing numbers in this file with a comma
          </Typography>
          <Input
            id={`drawing-number-${uploadedFile.id}`}
            value={drawingNumber ?? ""}
            onChange={(e) => onDrawingNumberChange?.(e.target.value)}
            fullWidth
            aria-labelledby={`drawing-number-label-${uploadedFile.id}`}
            bordered
            sx={{ maxWidth: 400 }}
          />
        </Box>
      )}

      <Button
        variant="contained"
        color="prompt"
        sx={{ mt: 2, minWidth: 140 }}
        size="small"
        onClick={onSave}
        data-testid={`save-${uploadedFile.file.name}`}
      >
        Save
        <Box sx={visuallyHidden} component="span">
          {` labels for ${uploadedFile.file.name}`}
        </Box>
      </Button>
    </Root>
  );
};
