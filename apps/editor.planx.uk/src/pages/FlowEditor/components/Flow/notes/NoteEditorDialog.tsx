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
import type { FlowNote, FlowNoteTarget } from "hooks/data/useFlowNotes";
import { useToast } from "hooks/useToast";
import { formatLastEditMessage } from "pages/FlowEditor/utils";
import React from "react";
import Input from "ui/shared/Input/Input";
import { object, string } from "yup";

import { useCreateFlowNote } from "./hooks/useCreateFlowNote";
import { useDeleteFlowNote } from "./hooks/useDeleteFlowNote";
import { useUpdateFlowNote } from "./hooks/useUpdateFlowNote";

interface NoteForm {
  text: string;
}

const validationSchema = object().shape({
  text: string().trim().required("Enter a note"),
});

type NoteEditorDialogProps =
  | { mode: "create"; target: FlowNoteTarget; onClose: () => void }
  | { mode: "edit"; note: FlowNote; onClose: () => void };

export const NoteEditorDialog: React.FC<NoteEditorDialogProps> = (props) => {
  const { mode, onClose } = props;
  const toast = useToast();
  const { createFlowNote, loading: creating } = useCreateFlowNote();
  const { updateFlowNote, loading: updating } = useUpdateFlowNote();
  const { deleteFlowNote, loading: deleting } = useDeleteFlowNote();

  const isEditing = mode === "edit";
  // TODO account for max last updated between `flow_note_content` and `flow_note_position`, currently exclusively content
  const lastEditMessage =
    props.mode === "edit"
      ? formatLastEditMessage(props.note.updatedAt, props.note.updatedByUser)
          .formatted
      : undefined;
  const isSaving = creating || updating;
  const savingLabel = isEditing ? "Updating..." : "Creating...";
  const idleLabel = isEditing ? "Update" : "Create";
  const submitLabel = isSaving ? savingLabel : idleLabel;

  const formik = useFormik<NoteForm>({
    initialValues: { text: props.mode === "edit" ? props.note.text : "" },
    validationSchema,
    validateOnMount: true,
    onSubmit: async ({ text }) => {
      try {
        if (props.mode === "edit") {
          await updateFlowNote(props.note.contentId, { text });
        } else {
          await createFlowNote({ ...props.target, text });
        }
        onClose();
      } catch {
        toast.error("Failed to save note, try again");
      }
    },
  });

  const handleDelete = async () => {
    if (props.mode !== "edit") return;
    try {
      await deleteFlowNote(props.note.positionId);
      onClose();
    } catch {
      toast.error("Failed to delete note, try again");
    }
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
          {lastEditMessage && (
            <Typography
              variant="body4"
              sx={{
                color: "text.secondary",
                mt: 1,
              }}
            >
              {lastEditMessage}
            </Typography>
          )}
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
              disabled={deleting}
              sx={{ backgroundColor: "background.default", gap: 1 }}
            >
              <DeleteIcon color="warning" fontSize="medium" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Box sx={{ marginLeft: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formik.isValid || isSaving}
            >
              {submitLabel}
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
