import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { visuallyHidden } from "@mui/utils";
import React, { useEffect, useRef, useState } from "react";
import { ValidationError } from "yup";

import { FileUploadSlot } from "../../FileUpload/model";
import { FileList } from "../model";
import { fileLabelSchema, formatFileLabelSchemaErrors } from "../schema";
import { FileCard } from "./FileCard";

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  closeModal: (
    _event: unknown,
    reason?: "backdropClick" | "escapeKeyDown",
  ) => void;
  removeFile: (slot: FileUploadSlot) => void;
  selectedSlotId: string | null;
}

export const FileTaggingModal = ({
  uploadedFiles,
  fileList,
  setFileList,
  closeModal,
  removeFile,
  selectedSlotId,
}: FileTaggingModalProps) => {
  const [errors, setErrors] = useState<Record<string, string> | undefined>();
  const fullScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );
  const initialFocusRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, []);

  const handleValidation = () => {
    fileLabelSchema
      .validate(fileList, { context: { slots: uploadedFiles } })
      .then(closeModal)
      .catch((err) => {
        if (err instanceof ValidationError) {
          const formattedErrors = formatFileLabelSchemaErrors(err);
          setErrors(formattedErrors);
        }
      });
  };

  return (
    <Dialog
      open
      onClose={closeModal}
      data-testid="file-tagging-dialog"
      maxWidth="xl"
      aria-labelledby="dialog-heading"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          overflow: "hidden",
        },
      }}
    >
      <DialogContent>
        <Box sx={{ mt: 1, mb: 4 }}>
          <Typography
            variant="h3"
            component="h2"
            id="dialog-heading"
            ref={initialFocusRef}
            tabIndex={-1}
            sx={{ outline: "none" }}
          >
            Tell us what these files show
            <Typography
              component="span"
              id="dialog-description"
              sx={visuallyHidden}
            >
              . You are in a dialog, for each uploaded file, select what type of
              information it contains. You can close this dialog by pressing
              escape.
            </Typography>
          </Typography>
        </Box>
        <Stack spacing={2}>
          {uploadedFiles.map((slot) => (
            <FileCard
              key={`tags-per-file-container-${slot.id}`}
              slot={slot}
              errors={errors}
              fileList={fileList}
              setFileList={setFileList}
              removeFile={removeFile}
              selectedSlotId={selectedSlotId}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          padding: 2,
        }}
      >
        <Box>
          <Button
            variant="contained"
            color="prompt"
            onClick={handleValidation}
            data-testid="modal-done-button"
          >
            Done
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ ml: 1.5 }}
            onClick={closeModal}
            data-testid="modal-cancel-button"
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
