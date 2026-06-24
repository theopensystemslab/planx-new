import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import React, { useState } from "react";
import { getNodeRoute } from "utils/routeUtils/utils";

import { Store, useStore } from "../../../lib/store";

interface NotesPanelProps {
  notes: Store.Node[];
  nodeId: string;
  parentId: string;
}

/** Returns #000 or #fff to maximise contrast against the given hex background. */
const getContrastColor = (hex: string): string => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, nodeId, parentId }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const navigate = useNavigate();
  const showNotes = useStore((state) => state.showNotes);

  if (!showNotes) return null;

  const count = notes.length;
  const addNoteRoute = getNodeRoute(parentId, nodeId);
  const addNoteParams = {
    team,
    flow,
    ...(parentId && { parent: parentId }),
    before: nodeId,
  };

  const handleBadgeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (count === 0) {
      navigate({
        to: addNoteRoute,
        params: addNoteParams,
        search: { type: "note" },
      });
    } else {
      setAnchorEl(e.currentTarget);
    }
  };

  const tooltipLabel =
    count > 0 ? `Show ${count} note${count === 1 ? "" : "s"}` : "Add note";

  return (
    <div className="notes-panel-trigger">
      <Tooltip title={tooltipLabel} placement="top" arrow>
        <button
          className={`notes-badge${count > 0 ? " notes-badge--has-notes" : ""}`}
          onClick={handleBadgeClick}
        >
          <StickyNote2Icon fontSize="inherit" />
          {count > 0 && <span>{count}</span>}
        </button>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              p: 1,
              minWidth: 200,
              maxWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            },
          },
        }}
      >
        {notes.map((note) => {
          const bg = note.data?.color ?? "#fffdb0";
          const textColor = getContrastColor(bg);
          return (
            <Link
              key={note.id}
              to={
                parentId
                  ? "/app/$team/$flow/nodes/$parent/nodes/$id/edit"
                  : "/app/$team/$flow/nodes/$id/edit"
              }
              params={{
                team,
                flow,
                id: note.id!,
                ...(parentId && { parent: parentId }),
              }}
              preload={false}
              onClick={() => setAnchorEl(null)}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  background: bg,
                  color: textColor,
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "inherit", color: "inherit" }}
                >
                  {note.data?.text || "Untitled note"}
                </Typography>
              </Box>
            </Link>
          );
        })}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            borderTop: 1,
            borderColor: "divider",
            pt: 1,
            mt: 0.5,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setAnchorEl(null);
              navigate({
                to: addNoteRoute,
                params: addNoteParams,
                search: { type: "note" },
              });
            }}
          >
            Add note
          </Button>
        </Box>
      </Popover>
    </div>
  );
};

export default NotesPanel;
