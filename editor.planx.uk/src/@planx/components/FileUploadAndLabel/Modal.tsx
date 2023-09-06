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
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import merge from "lodash/merge";
import React, { useEffect, useState } from "react";
import { usePrevious } from "react-use";
import ErrorWrapper from "ui/ErrorWrapper";

import { FileUploadSlot } from "../FileUpload/Public";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import {
  addOrAppendSlots,
  FileList,
  getTagsForSlot,
  removeSlots,
  resetAllSlots,
} from "./model";
import { fileLabelSchema } from "./schema";

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
}

export const FileTaggingModal = ({
  uploadedFiles,
  fileList,
  setFileList,
  setShowModal,
}: FileTaggingModalProps) => {
  const [error, setError] = useState<string | undefined>();

  const closeModal = (event: any, reason?: string) => {
    if (reason && reason == "backdropClick") {
      return;
    }
    setShowModal(false);
  };

  const handleValidation = () => {
    fileLabelSchema
      .validate(fileList, { context: { slots: uploadedFiles } })
      .then(closeModal)
      .catch((err) => setError(err.message));
  };

  return (
    <Dialog
      open
      onClose={closeModal}
      data-testid="file-tagging-dialog"
      maxWidth="xl"
      aria-labelledby="dialog-heading"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: (theme) => theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: (theme) => `20px solid ${theme.palette.primary.main}`,
          background: "#FFF",
          margin: (theme) => theme.spacing(2),
        },
      }}
    >
      <DialogContent>
        <Box sx={{ mt: 1, mb: 4 }}>
          <Typography
            variant="h3"
            component="h2"
            id="dialog-heading"
            sx={{ mb: "0.15em" }}
          >
            What do these files show?
          </Typography>
          <Typography variant="subtitle2">
            Select all document types that apply
          </Typography>
        </Box>
        {uploadedFiles.map((slot) => (
          <Box sx={{ mb: 4 }} key={`tags-per-file-container-${slot.id}`}>
            <UploadedFileCard {...slot} key={slot.id} />
            <SelectMultiple
              uploadedFile={slot}
              fileList={fileList}
              setFileList={setFileList}
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
        <ErrorWrapper error={error}>
          <Box>
            <Button
              variant="contained"
              onClick={handleValidation}
              data-testid="modal-done-button"
            >
              Done
            </Button>
            <Button
              variant="contained"
              color="secondary"
              sx={{ ml: 1.5 }}
              data-testid="modal-cancel-button"
            >
              Cancel
            </Button>
          </Box>
        </ErrorWrapper>
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
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const updateFileListWithTags = (
    previousTags: string[] | undefined,
    tags: string[],
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
        id={`select-multiple-file-tags-label-${uploadedFile.id}`}
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
        native={false}
        key={`select-${uploadedFile.id}`}
        id={`select-multiple-file-tags-${uploadedFile.id}`}
        variant="standard"
        multiple
        value={tags}
        onChange={handleChange}
        IconComponent={ArrowIcon}
        input={<Input key={`select-input-${uploadedFile.id}`} />}
        inputProps={{
          name: uploadedFile.id,
          "data-testid": "select",
          "aria-labelledby": `select-multiple-file-tags-label-${uploadedFile.id}`,
        }}
        sx={{
          border: (theme) => `1px solid ${theme.palette.border.main}`,
          background: (theme) => theme.palette.background.paper,
          "& > div": {
            minHeight: "50px",
            paddingTop: (theme) => theme.spacing(1),
            paddingBottom: (theme) => theme.spacing(1),
          },
          "& > div:focus": {
            background: (theme) => theme.palette.action.focus,
          },
          "& > svg": {
            color: (theme) => theme.palette.primary.main,
            width: "1.25em",
            height: "1.25em",
            top: "unset",
          },
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
      </Select>
    </FormControl>
  );
};
