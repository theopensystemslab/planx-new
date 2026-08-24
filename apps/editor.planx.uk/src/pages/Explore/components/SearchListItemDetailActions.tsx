import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import React from "react";

import type { SearchResult } from "./SearchResult";

interface SearchListItemDetailActionsProps {
  primaryAction?: SearchResult["primaryAction"];
  onClose?: () => void;
}

export const SearchListItemDetailActions: React.FC<
  SearchListItemDetailActionsProps
> = ({ primaryAction, onClose }) => {
  if (!onClose && !primaryAction) return null;

  return (
    <>
      <Divider />
      <DialogActions>
        {onClose && (
          <Button variant="contained" color="secondary" onClick={onClose}>
            Close
          </Button>
        )}
        {primaryAction && (
          <Button
            variant="contained"
            color="primary"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          >
            {primaryAction.label}
          </Button>
        )}
      </DialogActions>
    </>
  );
};
