import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent, SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import React, { useEffect, useState } from "react";
import { usePrevious } from "react-use";

import { FileUploadSlot } from "../FileUpload/Public";
import {
  addOrAppendSlots,
  FileList,
  getTagsForSlot,
  removeSlots,
} from "./model";

interface SelectMultipleProps extends SelectProps {
  uploadedFile: FileUploadSlot;
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
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

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  top: "16%",
  textDecoration: "underline",
  color: theme.palette.link.main,
  "&[data-shrink=true]": {
    textDecoration: "none",
    color: theme.palette.text.primary,
    top: "0",
    transform: "translate(14px, -5px) scale(0.85)",
  },
}));

const StyledSelect = styled(Select<string[]>)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.main}`,
  background: theme.palette.background.paper,
  "& > div": {
    minHeight: "50px",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  "& > div:focus": {
    background: theme.palette.action.focus,
  },
  "& > svg": {
    color: theme.palette.primary.main,
    width: "1.25em",
    height: "1.25em",
    top: "unset",
  },
}));

export const SelectMultiple = (props: SelectMultipleProps) => {
  const { uploadedFile, fileList, setFileList } = props;

  const initialTags = getTagsForSlot(uploadedFile.id, fileList);
  const [tags, setTags] = useState<string[]>(initialTags);
  const previousTags = usePrevious(tags) || initialTags;
  const [open, setOpen] = React.useState(false);

  const handleChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const updateFileListWithTags = (
    previousTags: string[] | undefined,
    tags: string[],
  ) => {
    const updatedTags = tags.filter((tag) => !previousTags?.includes(tag));
    const removedTags = previousTags?.filter((tag) => !tags?.includes(tag));

    if (updatedTags.length > 0) {
      const updatedFileList = addOrAppendSlots(
        updatedTags,
        uploadedFile,
        fileList,
      );
      setFileList(updatedFileList);
    }

    if (removedTags && removedTags.length > 0) {
      const updatedFileList = removeSlots(removedTags, uploadedFile, fileList);
      setFileList(updatedFileList);
    }
  };

  useEffect(() => {
    updateFileListWithTags(previousTags, tags);
  }, [tags]);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const options = (Object.keys(fileList) as Array<keyof typeof fileList>)
    .filter((fileListCategory) => fileList[fileListCategory].length > 0)
    .flatMap((category) =>
      fileList[category].map((fileType) => ({ category, ...fileType })),
    );

  return (
    <FormControl
      key={`form-${uploadedFile.id}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Autocomplete
        id={`select-multiple-file-tags-${uploadedFile.id}`}
        options={options}
        groupBy={(option) => option.category}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField {...params} label="What does this file show?" />
        )}
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
          <List key={key} role="group">
            <ListSubheader role="presentation">
              {capitalize(group)}
            </ListSubheader>
            {children}
          </List>
        )}
        renderOption={(props, option, { selected }) => (
          <ListItem {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            <ListItemText>{option.name}</ListItemText>
          </ListItem>
        )}
      />
      {/* <StyledSelect
        native={false}
        key={`select-${uploadedFile.id}`}
        id={`select-multiple-file-tags-${uploadedFile.id}`}
        variant="standard"
        multiple
        value={tags}
        onChange={handleChange}
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        IconComponent={ArrowIcon}
        input={<Input key={`select-input-${uploadedFile.id}`} />}
        inputProps={{
          name: uploadedFile.id,
          "data-testid": "select",
          "aria-labelledby": `select-multiple-file-tags-label-${uploadedFile.id}`,
        }}
        renderValue={(selected) => (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.5,
              padding: "0 0.5em",
            }}
          >
            {selected.map((value) => (
              <Chip
                key={`chip-${value}-${uploadedFile.id}`}
                label={value}
                variant="uploadedFileTag"
                size="small"
                sx={{ pointerEvents: "none" }}
              />
            ))}
          </Box>
        )}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
        }}
      >
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
              <ListSubheader
                key={`subheader-${fileListCategory}-${uploadedFile.id}`}
                disableSticky
              >
                <Typography py={1} variant="subtitle2" component="h4">
                  {`${capitalize(fileListCategory)} files`}
                </Typography>
              </ListSubheader>,
              ...fileList[fileListCategory].map((fileType) => {
                return [
                  <MenuItem
                    key={`menuitem-${fileType.name}-${uploadedFile.id}`}
                    value={fileType.name}
                    data-testid="select-menuitem"
                    disableRipple
                    disableTouchRipple
                  >
                    <Checkbox
                      key={`checkbox-${fileType.name}-${uploadedFile.id}`}
                      checked={tags.indexOf(fileType.name) > -1}
                      data-testid="select-checkbox"
                      inputProps={{
                        "aria-label": `${fileType.name}`,
                      }}
                    />
                    <ListItemText
                      key={`listitemtext-${fileType.name}-${uploadedFile.id}`}
                      primary={fileType.name}
                      id={fileType.name}
                    />
                  </MenuItem>,
                ];
              }),
            ];
          })}
      </StyledSelect> */}
    </FormControl>
  );
};
