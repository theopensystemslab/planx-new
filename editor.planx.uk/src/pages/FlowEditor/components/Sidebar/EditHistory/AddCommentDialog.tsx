import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useFormik } from "formik";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";

export const AddCommentDialog = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const formik = useFormik<{ comment: string }>({
    initialValues: { comment: "" },
    onSubmit: ({ comment }) => {
      console.log(`TODO insert record into flow_change_logs with comment: ${comment}`);
      setDialogOpen(false);
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
        maxWidth="md"
      >
        <DialogTitle variant="h3" component="h1">
          {`Add a comment to your edit history`}
        </DialogTitle>
        <DialogContent>
          {`Edit history reflects the individual operations on your flow. You can insert a custom comment into the timeline to add context. This will help other editors understand what's changed on next publish.`}
          <Box mt={2} component="form" onSubmit={formik.handleSubmit}>
            <InputLabel label="Comment">
              <Input
                bordered
                required={true}
                name="comment"
                value={formik.values.comment}
                onChange={formik.handleChange}
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
