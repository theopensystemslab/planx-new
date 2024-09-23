import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, {
  AutocompleteChangeReason,
  autocompleteClasses,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import { inputLabelClasses } from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import React, { forwardRef, PropsWithChildren, useMemo } from "react";
import { borderedFocusStyle } from "theme";

import { FileUploadSlot } from "../FileUpload/model";
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

const StyledAutocomplete = styled(
  Autocomplete<Option, true, true, false, "div">,
)(({ theme }) => ({
  marginTop: theme.spacing(2),
  // Prevent label from overlapping expand icon
  "& > div > label": {
    paddingRight: theme.spacing(3),
  },
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
      transform: "translate(0px, -22px) scale(0.85)",
    },
  },
}));

const CustomCheckbox = styled("span")(({ theme }) => ({
  display: "inline-flex",
  flexShrink: 0,
  position: "relative",
  width: 40,
  height: 40,
  borderColor: theme.palette.text.primary,
  border: "2px solid",
  background: "transparent",
  marginRight: theme.spacing(1.5),
  "&.selected::after": {
    content: "''",
    position: "absolute",
    height: 24,
    width: 12,
    borderColor: theme.palette.text.primary,
    borderBottom: "5px solid",
    borderRight: "5px solid",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
    cursor: "pointer",
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
    }}
    label="What does this file show? (select all that apply)"
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
    <CustomCheckbox aria-hidden="true" className={selected ? "selected" : ""} />
    {option.name}
  </ListItem>
);

const PopupIcon = <ArrowIcon sx={{ color: "primary.main" }} fontSize="large" />;

/**
 * Custom Listbox component
 * Used to wrap options within the autocomplete and append a custom element above the option list
 */
const ListboxComponent = forwardRef<typeof Box, PropsWithChildren>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      {...props}
      role="listbox"
      sx={{ paddingY: "0px !important" }}
    >
      {children}
    </Box>
  ),
);

export const SelectMultiple = (props: SelectMultipleProps) => {
  const { uploadedFile, fileList, setFileList } = props;

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
