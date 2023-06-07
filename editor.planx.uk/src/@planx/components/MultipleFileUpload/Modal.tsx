import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { FileUploadSlot } from "../FileUpload/Public";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";

const TagsPerFileContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
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
          <TagsPerFileContainer>
            <UploadedFileCard {...slot} key={slot.id} />
            <span>What does this file show?</span>
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
