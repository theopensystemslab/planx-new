import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { visuallyHidden } from "@mui/utils";
import React, { useEffect, useRef, useState } from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { ValidationError } from "yup";

import { FileUploadSlot } from "../../FileUpload/model";
import { UploadedFileCard } from "../../shared/PrivateFileUpload/UploadedFileCard";
import { FileList } from "../model";
import { fileLabelSchema, formatFileLabelSchemaErrors } from "../schema";
import { SelectMultipleFileTypes } from "./SelectMultipleFileTypes";

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  removeFile: (slot: FileUploadSlot) => void;
}

export const FileTaggingModal = ({
  uploadedFiles,
  fileList,
  setFileList,
  setShowModal,
  removeFile,
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

  const closeModal = (_event: any, reason?: string) => {
    if (reason && reason == "backdropClick") {
      return;
    }
    setShowModal(false);
  };

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
        {uploadedFiles.map((slot) => (
          <Box sx={{ mb: 4 }} key={`tags-per-file-container-${slot.id}`}>
            <ErrorWrapper error={errors?.[slot.id]}>
              <>
                <UploadedFileCard
                  {...slot}
                  key={slot.id}
                  removeFile={() => removeFile(slot)}
                />
                <SelectMultipleFileTypes
                  uploadedFile={slot}
                  fileList={fileList}
                  setFileList={setFileList}
                />
              </>
            </ErrorWrapper>
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
