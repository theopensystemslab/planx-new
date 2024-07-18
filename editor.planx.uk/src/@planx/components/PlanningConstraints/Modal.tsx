import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { Constraint, Metadata } from "@opensystemslab/planx-core/types";
import React, { useState } from "react";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";

import { formatEntityName } from "./List";
import { InaccurateConstraints } from "./Public";

interface OverrideEntitiesModalProps {
  showModal: boolean;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  fn: Constraint["fn"];
  entities: Constraint["data"] | null;
  metadata?: Metadata;
  inaccurateConstraints: InaccurateConstraints;
  setInaccurateConstraints: (
    value: React.SetStateAction<InaccurateConstraints>,
  ) => void;
}

export const OverrideEntitiesModal = ({
  showModal,
  setShowModal,
  fn,
  entities,
  metadata,
  inaccurateConstraints,
  setInaccurateConstraints,
}: OverrideEntitiesModalProps) => {
  const [errors, setErrors] = useState<Record<string, string> | undefined>();
  const title = `Which ${
    metadata?.plural?.toLowerCase() || "entities"
  } are inaccurate?`;

  const closeModal = (_event: any, reason?: string) => {
    if (reason && reason == "backdropClick") {
      return;
    }
    setShowModal(false);
  };

  // Directly update inaccurateConstraints in state when options are selected/deselected
  const changeCheckbox =
    (id: string, fn: Constraint["fn"]) =>
    (_checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      let newCheckedIds;

      if (inaccurateConstraints?.[fn]?.["entities"]?.includes(id)) {
        newCheckedIds = inaccurateConstraints?.[fn]?.["entities"]?.filter(
          (e) => e !== id,
        );
      } else {
        newCheckedIds = [
          ...(inaccurateConstraints?.[fn]?.["entities"] || []),
          id,
        ];
      }

      const newInaccurateConstraints = {
        ...inaccurateConstraints,
        ...{ [fn]: { entities: newCheckedIds, reason: "" } },
      };
      setInaccurateConstraints(newInaccurateConstraints);
    };

  const validateAndSubmit = () => {
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
            This constraint doesn't apply to this property
          </Typography>
          <Typography variant="body2" gutterBottom>
            Have we identified a planning constraint that you don't think
            applies to this property?
          </Typography>
          <Typography variant="body2" gutterBottom>
            We check constraints using a geospatial search, and minor
            differences in boundaries may lead to inaccurate results such as a
            constraint on an adjacent property.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>
              Select an inaccurate constraint below to proceed forward as if it
              does not apply to this property.
            </strong>{" "}
            Your feedback will also help us improve local open data.
          </Typography>
          <Divider sx={{ marginY: 2 }} />
          <Box marginBottom={2}>
            <InputLabel
              label={title}
              id={`checklist-label-inaccurate-entities`}
            >
              <ErrorWrapper
                error={errors?.["checked"]}
                id={`checklist-error-inaccurate-entities`}
              >
                <Grid container component="fieldset">
                  <legend style={visuallyHidden}>{title}</legend>
                  {Boolean(entities?.length) &&
                    entities?.map((e) => (
                      <ChecklistItem
                        key={`${e.entity}`}
                        id={`${e.entity}`}
                        label={formatEntityName(e, metadata)}
                        checked={
                          inaccurateConstraints?.[fn]?.["entities"]?.includes(
                            `${e.entity}`,
                          ) || false
                        }
                        onChange={changeCheckbox(`${e.entity}`, fn)}
                      />
                    ))}
                </Grid>
              </ErrorWrapper>
            </InputLabel>
          </Box>
          <Box>
            <InputLabel label="Tell us why" htmlFor="reason">
              <ErrorWrapper id={`input-error-inaccurate-entities`}>
                <Input name="reason" type="text" bordered required />
              </ErrorWrapper>
            </InputLabel>
          </Box>
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
            onClick={validateAndSubmit}
            data-testid="override-modal-submit-button"
          >
            Submit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ ml: 1.5 }}
            onClick={closeModal}
            data-testid="override-modal-cancel-button"
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
