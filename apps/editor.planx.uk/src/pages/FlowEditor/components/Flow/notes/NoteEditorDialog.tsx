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
import { DEFAULT_NOTE_COLOR } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import Input from "ui/shared/Input/Input";

export const NoteEditorDialog: React.FC = () => {
  const [
    noteEditorOpen,
    noteEditorMode,
    note,
    nodeId,
    placement,
    closeNoteEditor,
    createFlowNote,
    updateFlowNote,
    deleteFlowNote,
    userId,
  ] = useStore((state) => [
    state.noteEditorOpen,
    state.noteEditorMode,
    state.noteEditorNote,
    state.noteEditorNodeId,
    state.noteEditorPlacement,
    state.closeNoteEditor,
    state.createFlowNote,
    state.updateFlowNote,
    state.deleteFlowNote,
    state.user?.id,
  ]);

  const [text, setText] = useState(note?.text ?? "");
  const [color, setColor] = useState(note?.color ?? DEFAULT_NOTE_COLOR);

  if (!noteEditorOpen) return null;

  const isEditing = noteEditorMode === "edit";

  const handleSave = async () => {
    if (isEditing && note) {
      await updateFlowNote(note.id, { text, color });
    } else {
      await createFlowNote({ nodeId, placement, text, color });
    }
    closeNoteEditor();
  };

  const handleDelete = async () => {
    if (!note) return;
    await deleteFlowNote(note.id);
    closeNoteEditor();
  };

  return (
    <Dialog open fullWidth onClose={closeNoteEditor}>
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
          onClick={closeNoteEditor}
          size="large"
          sx={{ color: "grey.600" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Input
          multiline
          rows={5}
          name="note-text"
          placeholder="Write a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Box sx={{ mt: 2 }}>
          <ColorPicker
            label="Colour"
            inline
            color={color}
            onChange={setColor}
          />
        </Box>
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ justifyContent: "flex-start", alignItems: "stretch" }}
      >
        {isEditing && (
          <Button
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
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
