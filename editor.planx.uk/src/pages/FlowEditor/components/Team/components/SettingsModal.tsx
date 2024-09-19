import Dialog from "@mui/material/Dialog";
import React from "react";

import { EditorModalProps } from "../types";
import { DeleteUserModal } from "./DeleteUserModal";
import { EditorUpsertModal } from "./EditorUpsertModal";

export const SettingsModal = ({
  showModal,
  setShowModal,
  initialValues,
  actionType,
}: EditorModalProps) => {
  "dialog-create-user";
  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={`dialog-${actionType}-user`}
      PaperProps={{
        sx: (theme) => ({
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: `20px solid ${theme.palette.primary.main}`,
          background: theme.palette.background.paper,
          margin: theme.spacing(2),
        }),
      }}
      open={showModal || false}
      onClose={() => setShowModal(false)}
    >
      {actionType === "delete" ? (
        <DeleteUserModal
          setShowModal={setShowModal}
          initialValues={initialValues}
        />
      ) : (
        <EditorUpsertModal
          setShowModal={setShowModal}
          initialValues={initialValues}
          actionType={actionType}
        />
      )}
    </Dialog>
  );
};
