import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { ConfirmationDialog } from "components/ConfirmationDialog";

import { SearchListItemDetail } from "./SearchListItemDetail";
import { SearchListItemDetailActions } from "./SearchListItemDetailActions";
import type { Template } from "./types";
import { useTemplateDetails } from "./useTemplateDetails";

interface TemplateDetailsModalProps {
  template: Template;
  open: boolean;
  onClose: () => void;
}

export const TemplateDetailsModal: React.FC<TemplateDetailsModalProps> = ({
  template,
  open,
  onClose,
}) => {
  const { result, isConfirmationOpen, setIsConfirmationOpen, handleAddToTeam } =
    useTemplateDetails(template, { skip: !open, onAdded: onClose });

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="formWrap"
        slotProps={{
          paper: {
            sx: (theme) => ({ maxWidth: theme.breakpoints.values.formWrap }),
          },
        }}
      >
        <DialogContent sx={{ backgroundColor: "background.default" }}>
          <SearchListItemDetail result={result} />
        </DialogContent>
        <SearchListItemDetailActions
          primaryAction={result.primaryAction}
          onClose={onClose}
        />
      </Dialog>
      <ConfirmationDialog
        open={isConfirmationOpen}
        onClose={(confirmed) => {
          setIsConfirmationOpen(false);
          if (confirmed) handleAddToTeam();
        }}
        title="Add template to your team?"
        confirmText="Continue"
        cancelText="Cancel"
      >
        <Typography>
          You already subscribe to this template, subscribing again would mean
          maintaining more than one instance of this template.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};
