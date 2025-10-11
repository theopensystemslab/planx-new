import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import capitalize from "lodash/capitalize";
import React, { useMemo } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

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
}

interface Option extends UserFile {
  category: keyof FileList;
}

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.default,
  borderColor: theme.palette.border.main,
  borderStyle: "solid",
  borderWidth: "1px",
  borderTopColor: theme.palette.border.light,
  padding: theme.spacing(2),
}));

// Sanitize function to create valid IDs (no spaces)
const sanitizeId = (str: string): string => {
  return str.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
};

export const SelectMultipleFileTypes = (props: ChecklistProps) => {
  const { uploadedFile, fileList, setFileList } = props;

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
      <Typography variant="h3" mb={3} id={titleId}>
        What does this file show? (select all that apply)
        <Box component="span" sx={visuallyHidden}>
          This question refers to file: {uploadedFile.file.name}
        </Box>
      </Typography>

      {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
        <FormControl
          key={category}
          component="fieldset"
          sx={{
            width: "100%",
            mb: 1,
          }}
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

          <Box>
            {categoryOptions.map((option) => (
              <ChecklistItem
                key={`${category}-${option.name}`}
                id={sanitizeId(`${uploadedFile.id}-${category}-${option.name}`)}
                label={option.name}
                checked={initialTags.includes(option.name)}
                onChange={() => handleCheckboxChange(option)}
              />
            ))}
          </Box>
        </FormControl>
      ))}
    </Root>
  );
};
