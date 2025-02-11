import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";

interface AddCommentDialogProps {
  flowId: string;
  actorId: number;
}

export const AddCommentDialog = ({ flowId, actorId }: AddCommentDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  const formik = useFormik<{ comment: string }>({
    initialValues: { comment: "" },
    onSubmit: async (values, { resetForm }) => {
      await useStore.getState().addChangeLogComment(flowId, actorId, values.comment);
      setDialogOpen(false);
      resetForm({ values });
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Box>
      <AddButton onClick={() => setDialogOpen(true)}>
        Add a comment
      </AddButton>
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
        <DialogContent>
          {`History reflects the individual edits to your flow. Insert a custom comment into the timeline to add context. This will help other editors understand what's changed on next publish.`}
          <Box mt={2} component="form" onSubmit={formik.handleSubmit}>
            <InputLabel label="Comment">
              <Input
                required={true}
                name="comment"
                value={formik.values.comment}
                onChange={formik.handleChange}
                bordered
                multiline={true}
                rows={3}
              />
            </InputLabel>
          </Box>
        </DialogContent>
        <DialogActions sx={{ paddingX: 2 }}>
          <Button disableRipple onClick={() => setDialogOpen(false)}>BACK</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disableRipple
            onClick={() => formik.handleSubmit()}
          >
            ADD COMMENT
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
