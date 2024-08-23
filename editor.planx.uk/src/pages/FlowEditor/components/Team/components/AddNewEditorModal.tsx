import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";

import { AddNewEditorModalProps } from "../types";

export const AddNewEditorModal = ({
  showModal,
  setShowModal,
}: AddNewEditorModalProps) => (
  <Dialog
    aria-labelledby="dialog-heading"
    PaperProps={{
      sx: (theme) => ({
        width: "100%",
        maxWidth: theme.breakpoints.values.md,
        borderRadius: 0,
        borderTop: `20px solid ${theme.palette.primary.main}`,
        background: "#FFF",
        margin: theme.spacing(2),
      }),
    }}
    open={showModal}
    onClose={() => setShowModal(false)}
  >
    <form>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 4 }}>
          <Typography variant="h3" component="h2" id="dialog-heading">
            Add a new editor
          </Typography>
        </Box>
        <InputGroup flowSpacing>
          <InputLabel label="First name" htmlFor="firstname">
            <Input
              name="firstname"
              onChange={() => {
                console.log("bla"); // TODO in next PR
              }}
              value={""}
              errorMessage={""}
              id="firstname"
            />
          </InputLabel>
          <InputLabel label="Last name" htmlFor="lastname">
            <Input
              name="lastname"
              onChange={() => {
                console.log("bla"); // TODO in next PR
              }}
              value={""}
              errorMessage={""}
              id="lastname"
            />
          </InputLabel>
          <InputLabel label="Email address" htmlFor="email">
            <Input
              name="email"
              onChange={() => {
                console.log("bla"); // TODO in next PR
              }}
              value={""}
              errorMessage={""}
              id="email"
            />
          </InputLabel>
        </InputGroup>
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
            onClick={() => setShowModal(false)} // nothing yet
            data-testid="modal-create-user-button"
          >
            Create user
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ ml: 1.5 }}
            onClick={() => setShowModal(false)}
            data-testid="modal-cancel-button"
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </form>
  </Dialog>
);
