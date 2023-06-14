import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent, SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import merge from "lodash/merge";
import React, { useEffect, useState } from "react";

import { FileUploadSlot } from "../FileUpload/Public";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import { FileList, getTagsForSlot } from "./model";

const TagsPerFileContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

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
          borderRadius: 0,
          borderTop: (theme) => `10px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      <DialogContent>
        {props.uploadedFiles.map((slot) => (
          <TagsPerFileContainer key={`tags-per-file-container-${slot.id}`}>
            <UploadedFileCard {...slot} key={slot.id} />
            <SelectMultiple
              uploadedFile={slot}
              fileList={props.fileList}
              setFileList={props.setFileList}
            />
          </TagsPerFileContainer>
        ))}
      </DialogContent>
      <DialogActions style={{ display: "flex", justifyContent: "flex-start" }}>
        <Link
          component="button"
          onClick={() => props.setShowModal(false)}
          sx={{ paddingLeft: 2 }}
        >
          <Typography variant="body2">Done</Typography>
        </Link>
        <Link
          component="button"
          onClick={() => props.setShowModal(false)}
          sx={{ paddingLeft: 2 }}
        >
          <Typography variant="body2">Cancel</Typography>
        </Link>
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

  const handleChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const updateFileListWithTags = () => {
    const updatedFileList: FileList = merge(fileList);
    const categories = Object.keys(updatedFileList) as Array<
      keyof typeof updatedFileList
    >;

    tags.forEach((tag) => {
      categories.forEach((category) => {
        const updatedUserFileIndex = updatedFileList[category].findIndex(
          (fileType) => fileType.name === tag
        );
        if (updatedUserFileIndex > -1) {
          const updatedFileType =
            updatedFileList[category][updatedUserFileIndex];
          if (updatedFileType.slots) {
            updatedFileList[category][updatedUserFileIndex].slots?.push(
              uploadedFile
            );
          } else {
            updatedFileList[category][updatedUserFileIndex] = {
              ...updatedFileList[category][updatedUserFileIndex],
              slots: [uploadedFile],
            };
          }
        }
      });
    });

    setFileList(updatedFileList);
  };

  useEffect(() => {
    updateFileListWithTags();
  }, [tags]);

  return (
    <FormControl
      key={`form-${uploadedFile.id}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <InputLabel id={`select-mutliple-file-tags-label-${uploadedFile.id}`}>
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
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
