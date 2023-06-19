import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent, SelectProps } from "@mui/material/Select";
import capitalize from "lodash/capitalize";
import merge from "lodash/merge";
import React, { useEffect, useState } from "react";
import { usePrevious } from "react-use";

import { FileUploadSlot } from "../FileUpload/Public";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import {
  addOrAppendSlots,
  FileList,
  getTagsForSlot,
  removeSlots,
  resetAllSlots,
} from "./model";

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
}

export const FileTaggingModal = (props: FileTaggingModalProps) => {
  return (
    <Dialog
      open
      onClose={() => props.setShowModal(false)}
      data-testid="file-tagging-dialog"
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: (theme) => theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: (theme) => `20px solid ${theme.palette.primary.main}`,
          background: "#FFF",
        },
      }}
    >
      <DialogContent>
        {props.uploadedFiles.map((slot) => (
          <Box sx={{ mb: 4 }} key={`tags-per-file-container-${slot.id}`}>
            <UploadedFileCard {...slot} key={slot.id} />
            <SelectMultiple
              uploadedFile={slot}
              fileList={props.fileList}
              setFileList={props.setFileList}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          padding: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={() => props.setShowModal(false)}
          sx={{ paddingLeft: 2 }}
        >
          Done
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => props.setShowModal(false)}
          sx={{ paddingLeft: 2 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface SelectMultipleProps extends SelectProps {
  uploadedFile: FileUploadSlot;
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
}

const SelectMultiple = (props: SelectMultipleProps) => {
  const { uploadedFile, fileList, setFileList } = props;

  const initialTags = getTagsForSlot(uploadedFile.id, fileList);
  const [tags, setTags] = useState<string[]>(initialTags);
  const previousTags = usePrevious(tags);

  const handleChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const updateFileListWithTags = (
    previousTags: string[] | undefined,
    tags: string[]
  ) => {
    let updatedFileList: FileList = merge(fileList);
    const updatedTags = tags.filter((tag) => !previousTags?.includes(tag));
    const removedTags = previousTags?.filter((tag) => !tags?.includes(tag));

    if (updatedTags.length > 0) {
      updatedFileList = addOrAppendSlots(updatedTags, uploadedFile, fileList);
    }

    if (removedTags && removedTags.length > 0) {
      updatedFileList = removeSlots(removedTags, uploadedFile, fileList);
    }

    if (tags.length === 0 && previousTags) {
      updatedFileList = resetAllSlots(fileList);
    }

    setFileList(updatedFileList);
  };

  useEffect(() => {
    updateFileListWithTags(previousTags, tags);
  }, [tags]);

  return (
    <FormControl
      key={`form-${uploadedFile.id}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <InputLabel
        id={`select-mutliple-file-tags-label-${uploadedFile.id}`}
        sx={{
          top: "16%",
          textDecoration: "underline",
          color: (theme) => theme.palette.primary.main,
          "&[data-shrink=true]": {
            textDecoration: "none",
            color: (theme) => theme.palette.text.primary,
            top: "0",
            transform: "translate(14px, -5px) scale(0.85)",
          },
        }}
      >
        What does this file show?
      </InputLabel>
      <Select
        key={`select-${uploadedFile.id}`}
        id={`select-multiple-file-tags-${uploadedFile.id}`}
        labelId={`select-multiple-file-tags-label-${uploadedFile.id}`}
        variant="standard"
        multiple
        value={tags}
        onChange={handleChange}
        IconComponent={ArrowIcon}
        input={<Input key={`select-input-${uploadedFile.id}`} />}
        inputProps={{ name: uploadedFile.id }}
        sx={{
          border: (theme) => `1px solid ${theme.palette.secondary.main}`,
          background: (theme) => theme.palette.background.paper,
          minHeight: "50px",
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
        {(Object.keys(fileList) as Array<keyof typeof fileList>)
          .filter((fileListCategory) => fileList[fileListCategory].length > 0)
          .map((fileListCategory) => {
            return [
              <ListSubheader
                key={`subheader-${fileListCategory}-${uploadedFile.id}`}
              >
                {`${capitalize(fileListCategory)} files`}
              </ListSubheader>,
              ...fileList[fileListCategory].map((fileType) => {
                return [
                  <MenuItem
                    key={`menuitem-${fileType.name}-${uploadedFile.id}`}
                    value={fileType.name}
                  >
                    <Checkbox
                      key={`checkbox-${fileType.name}-${uploadedFile.id}`}
                      checked={tags.indexOf(fileType.name) > -1}
                    />
                    <ListItemText
                      key={`listitemtext-${fileType.name}-${uploadedFile.id}`}
                      primary={fileType.name}
                    />
                  </MenuItem>,
                ];
              }),
            ];
          })}
      </Select>
    </FormControl>
  );
};
