import { useMutation } from "@apollo/client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import React from "react";

import { REMOVE_TEAM_MEMBER } from "../queries";
import type { RemoveUserModalProps } from "../types";

export const RemoveUserModal: React.FC<RemoveUserModalProps> = ({
  onClose,
  member,
}) => {
  const toast = useToast();

  const [removeUser, { loading }] = useMutation(REMOVE_TEAM_MEMBER, {
    onCompleted: () => {
      onClose();
      toast.success(
        `Successfully removed ${member.firstName} ${member.lastName}`,
      );
    },
    onError: () => {
      toast.error(
        `Failed to remove ${member.firstName} ${member.lastName}, try again`,
      );
    },
  });

  const handleClick = () => {
    removeUser({ variables: { id: member.id } });
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={"modal-remove-user"}
      open
      onClose={onClose}
      fullWidth
    >
      <DialogTitle variant="h3" component="h1" id="dialog-heading">
        Remove a user
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" component="p">
          {`Do you want to remove ${member.firstName} ${member.lastName}?`}
        </Typography>
        <br />
        <Typography variant="body1" component="p">
          They will be moved to Archived Users and no longer have access to
          PlanX
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          type="reset"
          sx={{ backgroundColor: "background.default" }}
          onClick={onClose}
          data-testid="modal-cancel-button"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          type="submit"
          data-testid="modal-remove-user-button"
          disabled={loading}
          onClick={handleClick}
        >
          Remove user
        </Button>
      </DialogActions>
    </Dialog>
  );
};
