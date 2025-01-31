import {
  AutocompleteChangeReason,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import capitalize from "lodash/capitalize";
import React, { forwardRef, PropsWithChildren, useMemo } from "react";
import { RenderGroupHeaderBlock } from "ui/shared/Autocomplete/components/RenderGroupHeaderBlock";
import { RenderOptionCheckbox } from "ui/shared/Autocomplete/components/RenderOptionCheckbox";
import { SelectMultiple } from "ui/shared/SelectMultiple";

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

/**
 * Function which returns the groups (ul elements) used by Autocomplete
 */
const renderGroup: AutocompleteProps<
  Option,
  true,
  true,
  false,
  "div"
>["renderGroup"] = (params) => (
  <RenderGroupHeaderBlock
    key={params.key}
    params={params}
    displayName={`${capitalize(params.group)} files`}
  />
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
>["renderOption"] = (props, option, state) => (
  <RenderOptionCheckbox
    listProps={props}
    displayName={option.name}
    state={state}
  />
);

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

export const SelectMultipleFileTypes = (props: SelectMultipleProps) => {
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
    [initialTags, options],
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
    <SelectMultiple
      getOptionLabel={(option) => option.name}
      groupBy={(option) => option.category}
      id={`select-multiple-file-tags-${uploadedFile.id}`}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      key={`form-${uploadedFile.id}`}
      label="What does this file show? (select all that apply)"
      ListboxComponent={ListboxComponent}
      onChange={handleChange}
      options={options}
      renderGroup={renderGroup}
      renderOption={renderOption}
      value={value}
    />
  );
};
