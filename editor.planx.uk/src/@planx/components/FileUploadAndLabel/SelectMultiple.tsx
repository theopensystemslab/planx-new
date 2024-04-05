import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, {
  AutocompleteChangeReason,
} from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import React, { forwardRef, PropsWithChildren, useState } from "react";

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

const ListHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 1.5),
  background: theme.palette.grey[200],
  // Offset default padding of MuiList
  margin: "-8px 0 8px",
}));

export const SelectMultiple = (props: SelectMultipleProps) => {
  const { uploadedFile, fileList, setFileList } = props;
  const [open, setOpen] = useState(false);
  const closePopper = () => setOpen(false);
  const openPopper = () => setOpen(true);

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

  /**
   * Custom listbox component
   * Used to wrap options within the autocomplete and append a custom element above the option list
   */
  const ListboxComponent = forwardRef<typeof Box, PropsWithChildren>(
    ({ children, ...props }, ref) => {
      return (
        <Box ref={ref} {...props} role="listbox">
          <ListHeader>
            <ListSubheader disableGutters>
              <Typography variant="h4" component="h3" pr={3}>
                Select all that apply
              </Typography>
              <Button
                variant="contained"
                color="prompt"
                onClick={closePopper}
                aria-label="Close list"
              >
                Done
              </Button>
            </ListSubheader>
          </ListHeader>
          {children}
        </Box>
      );
    },
  );

  return (
    <FormControl
      key={`form-${uploadedFile.id}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Autocomplete
        onChange={handleChange}
        value={value}
        open={open}
        onOpen={openPopper}
        onClose={closePopper}
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
        ListboxComponent={ListboxComponent}
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
