import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { Constraint, Metadata } from "@opensystemslab/planx-core/types";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

interface OverrideEntitiesModalProps {
  showModal: boolean;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  entities: Constraint["data"] | null;
  metadata?: Metadata;
  disputedEntities: string[];
  setDisputedEntities: (value: React.SetStateAction<string[]>) => void;
}

export const OverrideEntitiesModal = ({
  showModal,
  setShowModal,
  entities,
  metadata,
  disputedEntities,
  setDisputedEntities,
}: OverrideEntitiesModalProps) => {
  const handleValidation = () => {
    console.log("todo");
  };

  const closeModal = (_event: any, reason?: string) => {
    if (reason && reason == "backdropClick") {
      return;
    }
    setShowModal(false);
  };

  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      data-testid="override-planning-constraint-entities-dialog"
      maxWidth="xl"
      aria-labelledby="dialog-heading"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: (theme) => theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: (theme) => `20px solid ${theme.palette.primary.main}`,
          background: "#FFF",
          margin: (theme) => theme.spacing(2),
        },
      }}
    >
      <DialogContent>
        <Box>
          <Typography
            variant="h3"
            component="h2"
            id="dialog-heading"
            gutterBottom
            mb={2}
          >
            Report an inaccuracy
          </Typography>
          <Typography variant="body2" gutterBottom>
            Have we identified a planning constraint that you don't think
            applies to your property?
          </Typography>
          <Typography variant="body2" gutterBottom>
            We check constraints using a geospatial search, and minor
            differences in boundaries can occassionally lead to adjacent
            constraints being incorrectly returned.
          </Typography>
          <Typography variant="body2" gutterBottom>
            Select any incorrect constraints to proceed with the rest of your
            application as if they do not apply, and we'll relay your report and
            the original search result with your submission. Your feedback will
            help councils improve their public data.
          </Typography>
          <Divider sx={{ marginY: 2 }} />
          <Typography id="entities-group" variant="body1">
            {`Which ${
              metadata?.plural?.toLowerCase() || "entities"
            } are inaccurate?`}
          </Typography>
          <List
            disablePadding
            dense
            sx={{ marginBottom: 2 }}
            role="group"
            aria-labelledby="entities-group"
          >
            {Boolean(entities?.length) &&
              entities?.map((e) => (
                <ListItem
                  key={`${e.entity}-li`}
                  dense
                  disablePadding
                  disableGutters
                >
                  <ChecklistItem
                    label={
                      (e.name as string) ||
                      ((e["flood-risk-level"] &&
                        `${metadata?.name} - Level ${e["flood-risk-level"]}`) as string) ||
                      (`Planning Data entity #${e.entity}` as string)
                    }
                    checked={false}
                    onChange={() => console.log("clicked this one")}
                  />
                </ListItem>
              ))}
          </List>
          <InputLabel label="Tell us why" htmlFor="reason">
            <Input name="reason" type="text" bordered required />
          </InputLabel>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          padding: 2,
        }}
      >
        <Box>
          <Button
            variant="contained"
            color="prompt"
            onClick={handleValidation}
            data-testid="modal-done-button"
          >
            Done
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ ml: 1.5 }}
            onClick={closeModal}
            data-testid="modal-cancel-button"
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
