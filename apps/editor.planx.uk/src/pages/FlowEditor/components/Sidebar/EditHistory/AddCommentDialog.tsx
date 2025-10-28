import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

interface AddCommentDialogProps {
  flowId: string;
  actorId: number;
}

export const AddCommentDialog = ({
  flowId,
  actorId,
}: AddCommentDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  const formik = useFormik<{ comment: string }>({
    initialValues: { comment: "" },
    onSubmit: async (values, { resetForm }) => {
      if (!values.comment.trim()) {
        setShowError(true);
      } else {
        await useStore
          .getState()
          .addFlowComment(flowId, actorId, values.comment);
        setDialogOpen(false);
        resetForm();
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Box>
      <Box ml={-0.5}>
        <AddButton onClick={() => setDialogOpen(true)} size="small">
          Add a comment
        </AddButton>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
      >
        <DialogTitle variant="h3" component="h1">
          {`Add a comment`}
        </DialogTitle>
        <DialogContent dividers>
          {`History reflects the individual edits to your flow. Insert a custom comment into the timeline to add context. This will help other editors understand what's changed on next publish.`}
          <Box mt={2} component="form" onSubmit={formik.handleSubmit}>
            <InputLabel label="Comment">
              <ErrorWrapper
                error={showError ? "Enter a comment" : undefined}
                id="add-comment-input-error"
              >
                <Input
                  required
                  name="comment"
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  bordered
                  multiline
                  rows={3}
                />
              </ErrorWrapper>
            </InputLabel>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => setDialogOpen(false)}
            sx={{ backgroundColor: "background.default" }}
          >
            Back
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            onClick={() => formik.handleSubmit()}
          >
            Add comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
