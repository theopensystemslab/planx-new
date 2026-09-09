import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import React from "react";
import { CloseButton } from "ui/shared/CloseButton";

import NotionEmbed, { type NotionEmbedPage } from "./NotionEmbed";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    // Nearly full-height, matching the node editor modal
    height: "calc(100vh - 64px)",
    maxHeight: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
  },
}));

interface Props {
  page?: NotionEmbedPage;
  title: string;
  open: boolean;
  onClose: () => void;
}

/** Renders a Notion embed in a large dialog rather than a full page */
const NotionDialog: React.FC<Props> = ({ page, title, open, onClose }) => (
  <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="xl">
    <DialogTitle
      variant="h3"
      component="h1"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1,
        px: 2.5,
      }}
    >
      {title}
      <CloseButton onClick={onClose} sx={{ marginRight: -1 }} />
    </DialogTitle>
    <DialogContent
      dividers
      sx={{ p: 0, flexGrow: 1, minHeight: 0, display: "flex" }}
    >
      {page && <NotionEmbed page={page} title={title} />}
    </DialogContent>
  </StyledDialog>
);

export default NotionDialog;
