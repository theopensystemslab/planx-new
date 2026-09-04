import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";

import type { SearchResult } from "./SearchResult";

interface SearchListItemDetailActionsProps {
  primaryAction?: SearchResult["primaryAction"];
  secondaryAction?: SearchResult["secondaryAction"];
  onClose?: () => void;
}

export const SearchListItemDetailActions: React.FC<
  SearchListItemDetailActionsProps
> = ({ primaryAction, secondaryAction, onClose }) => {
  if (!onClose && !primaryAction && !secondaryAction) return null;

  return (
    <>
      <Divider />
      <DialogActions
        sx={{
          bgcolor: "background.paper",
          justifyContent: "flex-end",
        }}
      >
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
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            variant="contained"
            color="secondary"
          >
            {secondaryAction.label}
          </Button>
        )}
      </DialogActions>
    </>
  );
};
