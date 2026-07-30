import Close from "@mui/icons-material/CloseOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import type { FlowNote, NotePlacement } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Input from "ui/shared/Input/Input";
import { object, string } from "yup";

interface NoteForm {
  text: string;
}

const validationSchema = object().shape({
  text: string().trim().required("Enter a note"),
});

interface NoteEditorDialogProps {
  mode: "create" | "edit";
  note?: FlowNote;
  nodeId?: string;
  placement?: NotePlacement;
  onClose: () => void;
}

export const NoteEditorDialog: React.FC<NoteEditorDialogProps> = ({
  mode,
  note,
  nodeId,
  placement,
  onClose,
}) => {
  const [createFlowNote, updateFlowNote, deleteFlowNote] = useStore((state) => [
    state.createFlowNote,
    state.updateFlowNote,
    state.deleteFlowNote,
  ]);

  const isEditing = mode === "edit";

  const formik = useFormik<NoteForm>({
    initialValues: { text: note?.text ?? "" },
    validationSchema,
    validateOnMount: true,
    onSubmit: async ({ text }) => {
      if (isEditing && note) {
        await updateFlowNote(note.id, { text });
      } else {
        await createFlowNote({ nodeId, placement, text });
      }
      onClose();
    },
  });

  const handleDelete = async () => {
    if (!note) return;
    await deleteFlowNote(note.id);
    onClose();
  };

  return (
    <Dialog open fullWidth onClose={onClose}>
      <DialogTitle
        sx={{
          py: 1,
          px: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StickyNote2Icon sx={{ color: "text.primary", fontSize: "1.6rem" }} />
          <Typography variant="h3" component="h1">
            Note
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="large"
          sx={{ color: "grey.600" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ px: 4, py: 3 }}>
          <Input
            multiline
            rows={5}
            placeholder="Write a note..."
            errorMessage={formik.touched.text ? formik.errors.text : undefined}
            {...formik.getFieldProps("text")}
          />
        </DialogContent>
        <DialogActions
          disableSpacing
          sx={{ justifyContent: "flex-start", alignItems: "stretch" }}
        >
          {isEditing && (
            <Button
              type="button"
              color="secondary"
              variant="contained"
              onClick={handleDelete}
              sx={{ backgroundColor: "background.default", gap: 1 }}
            >
              <DeleteIcon color="warning" fontSize="medium" />
              Delete
            </Button>
          )}
          <Box sx={{ marginLeft: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formik.isValid}
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
