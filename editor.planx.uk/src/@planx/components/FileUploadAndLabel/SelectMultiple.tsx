import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, {
  AutocompleteChangeReason,
  autocompleteClasses,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import { inputLabelClasses } from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import React, { forwardRef, PropsWithChildren, useMemo, useState } from "react";
import { borderedFocusStyle } from "theme";
import Checkbox from "ui/shared/Checkbox";

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
}));

const StyledAutocomplete = styled(
  Autocomplete<Option, true, true, false, "div">,
)(({ theme }) => ({
  marginTop: theme.spacing(2),
  // Vertically center "large" size caret icon
  [`& .${autocompleteClasses.endAdornment}`]: {
    top: "unset",
  },
  "&:focus-within": {
    "& svg": {
      color: "black",
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "&:focus-within": {
    ...borderedFocusStyle,
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: "1px solid transparent !important",
    },
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderRadius: 0,
    border: `1px solid${theme.palette.border.main} !important`,
  },
  "& fieldset": {
    borderColor: theme.palette.border.main,
  },
  backgroundColor: theme.palette.background.paper,
  [`& .${outlinedInputClasses.root}, input`]: {
    cursor: "pointer",
  },
  [`& .${inputLabelClasses.root}`]: {
    textDecoration: "underline",
    color: theme.palette.primary.main,
    "&[data-shrink=true]": {
      textDecoration: "none",
      color: theme.palette.text.primary,
      paddingY: 0,
      transform: "translate(14px, -22px) scale(0.85)",
    },
  },
}));

/**
 * Function which returns the Input component used by Autocomplete
 */
const renderInput: AutocompleteProps<
  Option,
  true,
  true,
  false,
  "div"
>["renderInput"] = (params) => (
  <StyledTextField
    {...params}
    InputProps={{
      ...params.InputProps,
      notched: false,
      inputMode: "none",
    }}
    label="What does this file show?"
  />
);

/**
 * Function which returns the groups (ul elements) used by Autocomplete
 */
const renderGroup: AutocompleteProps<
  Option,
  true,
  true,
  false,
  "div"
>["renderGroup"] = ({ group, key, children }) => (
  <List
    key={`group-${key}`}
    role="group"
    sx={{ paddingY: 0 }}
    aria-labelledby={`${group}-label`}
  >
    <ListSubheader
      id={`${group}-label`}
      role="presentation"
      disableSticky
      sx={(theme) => ({
        borderTop: 1,
        borderColor: theme.palette.border.main,
      })}
    >
      <Typography py={1} variant="subtitle2" component="h4">
        {`${capitalize(group)} files`}
      </Typography>
    </ListSubheader>
    {children}
  </List>
);

/**
 * Function which returns the options (li elements) used by Autocomplete
 */
const renderOption: AutocompleteProps<
  Option,
  true,
  true,
  false,
  "div"
>["renderOption"] = (props, option, { selected }) => (
  <ListItem {...props}>
    <Checkbox
      data-testid="select-checkbox"
      checked={selected}
      inputProps={{
        "aria-label": option.name,
      }}
    />
    <ListItemText sx={{ ml: 2 }}>{option.name}</ListItemText>
  </ListItem>
);

const PopupIcon = <ArrowIcon sx={{ color: "primary.main" }} fontSize="large" />;

export const SelectMultiple = (props: SelectMultipleProps) => {
  const { uploadedFile, fileList, setFileList } = props;
  const [open, setOpen] = useState(false);
  const closePopper = () => setOpen(false);
  const openPopper = () => setOpen(true);

  const initialTags = getTagsForSlot(uploadedFile.id, fileList);

  /**
   * Options for autocomplete
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
   * Previous values to pre-populate autocomplete
   */
  const value: Option[] = useMemo(
    () =>
      initialTags.flatMap((tag) => options.filter(({ name }) => name === tag)),
    [initialTags],
  );

  /**
   * Update FileList (from main Public.tsx component) when values are added or removed from Autocomplete
   */
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
   * Custom Listbox component
   * Used to wrap options within the autocomplete and append a custom element above the option list
   */
  const ListboxComponent = forwardRef<typeof Box, PropsWithChildren>(
    ({ children, ...props }, ref) => {
      return (
        <>
          <Box>
            <ListHeader>
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
            </ListHeader>
          </Box>
          <Box
            ref={ref}
            {...props}
            role="listbox"
            sx={{ paddingY: "0px !important" }}
          >
            {children}
          </Box>
        </>
      );
    },
  );

  return (
    <FormControl
      key={`form-${uploadedFile.id}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <StyledAutocomplete
        role="status"
        aria-atomic={true}
        aria-live="polite"
        disableClearable
        disableCloseOnSelect
        getOptionLabel={(option) => option.name}
        groupBy={(option) => option.category}
        id={`select-multiple-file-tags-${uploadedFile.id}`}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        ListboxComponent={ListboxComponent}
        multiple
        onChange={handleChange}
        onClose={closePopper}
        onOpen={openPopper}
        open={open}
        options={options}
        popupIcon={PopupIcon}
        renderGroup={renderGroup}
        renderInput={renderInput}
        renderOption={renderOption}
        value={value}
        ChipProps={{
          variant: "uploadedFileTag",
          size: "small",
          sx: { pointerEvents: "none" },
          onDelete: undefined,
        }}
        componentsProps={{
          popupIndicator: {
            disableRipple: true,
          },
          popper: {
            sx: {
              boxShadow: 10,
            },
          },
        }}
      />
    </FormControl>
  );
};
