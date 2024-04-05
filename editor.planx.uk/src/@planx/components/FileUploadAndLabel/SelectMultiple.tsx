import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, {
  AutocompleteChangeReason,
} from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import capitalize from "lodash/capitalize";
import React from "react";

import { FileUploadSlot } from "../FileUpload/Public";
import {
  addOrAppendSlots,
  FileList,
  getTagsForSlot,
  removeSlots,
  UserFile,
} from "./model";

interface SelectMultipleProps {
  uploadedFile: FileUploadSlot;
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
}

interface Option extends UserFile {
  category: keyof FileList;
}

export const SelectMultiple = (props: SelectMultipleProps) => {
  const { uploadedFile, fileList, setFileList } = props;

  const initialTags = getTagsForSlot(uploadedFile.id, fileList);

  const handleChange = (
    _event: React.SyntheticEvent,
    value: Option[],
    reason: AutocompleteChangeReason,
  ) => {
    const selectedTags = value.map(({ name }) => name);

    switch (reason) {
      case "selectOption": {
        const updatedTags = selectedTags.filter(
          (tag) => !initialTags?.includes(tag),
        );
        const updatedFileList = addOrAppendSlots(
          updatedTags,
          uploadedFile,
          fileList,
        );
        setFileList(updatedFileList);
        break;
      }
      case "removeOption": {
        const removedTags = initialTags?.filter(
          (tag) => !selectedTags?.includes(tag),
        );
        const updatedFileList = removeSlots(
          removedTags,
          uploadedFile,
          fileList,
        );
        setFileList(updatedFileList);
        break;
      }
    }
  };

  /**
   * Options for autocomplete
   * FileList with appended "category" property for grouping
   */
  const options: Option[] = (
    Object.keys(fileList) as Array<keyof typeof fileList>
  )
    .filter((fileListCategory) => fileList[fileListCategory].length > 0)
    .flatMap((category) =>
      fileList[category].map((fileType) => ({ category, ...fileType })),
    );

  /**
   * Previous values to pre-populate autocomplete
   */
  const value: Option[] = initialTags.flatMap((tag) =>
    options.filter(({ name }) => name === tag),
  );

  return (
    <FormControl
      key={`form-${uploadedFile.id}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Autocomplete
        onChange={handleChange}
        value={value}
        id={`select-multiple-file-tags-${uploadedFile.id}`}
        options={options}
        groupBy={(option) => option.category}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="What does this file show?"
            // Disable text input
            onKeyDown={(e) => {
              e.preventDefault();
            }}
            // Hide text input caret
            sx={{ caretColor: "transparent" }}
          />
        )}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        multiple
        disableCloseOnSelect
        disableClearable
        popupIcon={<ArrowIcon />}
        ListboxComponent={Box}
        ChipProps={{
          variant: "uploadedFileTag",
          size: "small",
          sx: { pointerEvents: "none" },
          onDelete: undefined,
        }}
        renderGroup={({ group, key, children }) => (
          <List key={`group-${key}`} role="group">
            <ListSubheader role="presentation">
              {capitalize(group)}
            </ListSubheader>
            {children}
          </List>
        )}
        renderOption={(props, option, { selected }) => (
          <ListItem {...props}>
            <Checkbox
              data-testid="select-checkbox"
              inputProps={{
                "aria-label": `${option.name}`,
              }}
              checked={selected}
            />
            <ListItemText>{option.name}</ListItemText>
          </ListItem>
        )}
      />
      {/*
        <ListSubheader disableGutters>
          <ListHeader>
            <Typography variant="h4" component="h3" pr={3}>
              Select all that apply
            </Typography>
            <Button
              variant="contained"
              color="prompt"
              onClick={handleClose}
              aria-label="Close list"
            >
              Done
            </Button>
          </ListHeader>
        </ListSubheader>
        {(Object.keys(fileList) as Array<keyof typeof fileList>)
          .filter((fileListCategory) => fileList[fileListCategory].length > 0)
          .map((fileListCategory) => {
            return [

              ...fileList[fileListCategory].map((fileType) => {
                return [
                  <MenuItem
                    disableRipple
                    disableTouchRipple
                  >
                    <Checkbox
                      inputProps={{
                        "aria-label": `${fileType.name}`,
                      }}
                    />
                  </MenuItem> 
                    */}
    </FormControl>
  );
};
