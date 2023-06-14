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
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent, SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import React from "react";

import { FileUploadSlot } from "../FileUpload/Public";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import { FileList } from "./model";

const TagsPerFileContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
  fileList: FileList;
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
        },
      }}
    >
      <DialogContent>
        {props.uploadedFiles.map((slot) => (
          <TagsPerFileContainer>
            <UploadedFileCard {...slot} key={slot.id} />
            <SelectMultiple name={slot.id} fileList={props.fileList} />
          </TagsPerFileContainer>
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          padding: (theme) => theme.spacing(2),
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
  name: string;
  fileList: FileList;
}

const SelectMultiple = (props: SelectMultipleProps) => {
  const { name, fileList } = props;
  const [tags, setTags] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <FormControl
      key={`form-${name}`}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <InputLabel
        id={`select-mutliple-file-tags-label-${name}`}
        sx={{ top: "15%", color: (theme) => theme.palette.text.primary }}
      >
        What does this file show?
      </InputLabel>
      <Select
        key={`select-${name}`}
        id={`select-multiple-file-tags-${name}`}
        labelId={`select-multiple-file-tags-label-${name}`}
        variant="standard"
        multiple
        value={tags}
        onChange={handleChange}
        IconComponent={ArrowIcon}
        input={<Input />}
        inputProps={{ name }}
        sx={{
          border: (theme) => `1px solid ${theme.palette.text.primary}`,
          minHeight: "44px",
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
              <Chip label={value} variant="uploadedFileTag" size="small" />
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
              <ListSubheader key={`subheader-${fileListCategory}-${name}`}>
                {`${capitalize(fileListCategory)} files`}
              </ListSubheader>,
              ...fileList[fileListCategory].map((fileType) => {
                return [
                  <MenuItem
                    key={`menuitem-${fileType.name}-${name}`}
                    value={fileType.name}
                  >
                    <Checkbox
                      key={`checkbox-${fileType.name}-${name}`}
                      checked={tags.indexOf(fileType.name) > -1}
                    />
                    <ListItemText
                      key={`listitemtext-${fileType.name}-${name}`}
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
