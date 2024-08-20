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
import omit from "lodash/omit";
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

const ERROR_MESSAGES = {
  checklist: "Select at least one option",
  input: "Enter a value", // @todo split into empty & maxLength input errors
};

export const OverrideEntitiesModal = ({
  showModal,
  setShowModal,
  fn,
  entities,
  metadata,
  inaccurateConstraints,
  setInaccurateConstraints,
}: OverrideEntitiesModalProps) => {
  const initialCheckedOptions = inaccurateConstraints?.[fn]?.["entities"];
  const [checkedOptions, setCheckedOptions] = useState<string[] | undefined>(
    initialCheckedOptions,
  );
  const [showChecklistError, setShowChecklistError] = useState<boolean>(false);

  const initialTextInput = inaccurateConstraints?.[fn]?.["reason"];
  const [textInput, setTextInput] = useState<string | undefined>(
    initialTextInput,
  );
  const [showInputError, setShowInputError] = useState<boolean>(false);

  const title = `Which ${
    metadata?.plural?.toLowerCase() || "entities"
  } are inaccurate?`;

  const closeModal = (_event: any, reason?: string) => {
    if (reason && reason == "backdropClick") {
      return;
    }

    // Revert any non-submitted inputs on cancel & clear errors
    setCheckedOptions(initialCheckedOptions);
    setShowChecklistError(false);
    setTextInput(initialTextInput);
    setShowInputError(false);

    // Close modal
    setShowModal(false);
  };

  const changeCheckbox =
    (id: string) =>
    (_checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      let newCheckedIds;

      if (checkedOptions?.includes(id)) {
        newCheckedIds = checkedOptions.filter((e) => e !== id);
      } else {
        newCheckedIds = [...(checkedOptions || []), id];
      }

      if (newCheckedIds.length > 0) {
        setShowChecklistError(false);
      }
      setCheckedOptions(newCheckedIds);
    };

  const changeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length) {
      setShowInputError(false);
    }
    setTextInput(e.target.value);
  };

  const validateAndSubmit = () => {
    const invalidChecklist = !checkedOptions || checkedOptions.length === 0;
    const invalidInput = !textInput || textInput.trim().length === 0;

    // All form fields are required to submit
    if (invalidChecklist && invalidInput) {
      // If you're re-opening the modal to remove previous answers
      if (initialCheckedOptions?.length && initialTextInput) {
        // Sync cleared form data to parent state
        const newInaccurateConstraints = omit(inaccurateConstraints, fn);
        setInaccurateConstraints(newInaccurateConstraints);
        setShowModal(false);
      } else {
        // If the form was empty to start
        setShowChecklistError(true);
        setShowInputError(true);
      }
    } else if (invalidChecklist) {
      setShowChecklistError(true);
    } else if (invalidInput) {
      setShowInputError(true);
    } else {
      // Update parent component state on valid submit
      const newInaccurateConstraints = {
        ...inaccurateConstraints,
        ...{ [fn]: { entities: checkedOptions, reason: textInput } },
      };
      setInaccurateConstraints(newInaccurateConstraints);
      setShowModal(false);
    }
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
        <Box component="form">
          <Typography
            variant="h3"
            component="h2"
            id="dialog-heading"
            gutterBottom
            mb={2}
          >
            I don't think this constraint applies to this property
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
                error={
                  showChecklistError ? ERROR_MESSAGES["checklist"] : undefined
                }
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
                          checkedOptions?.includes(`${e.entity}`) || false
                        }
                        onChange={changeCheckbox(`${e.entity}`)}
                      />
                    ))}
                </Grid>
              </ErrorWrapper>
            </InputLabel>
          </Box>
          <Box>
            <InputLabel label="Tell us why" htmlFor="reason">
              <ErrorWrapper
                error={showInputError ? ERROR_MESSAGES["input"] : undefined}
                id={`input-error-inaccurate-entities`}
              >
                <Input
                  bordered
                  required
                  multiline
                  rows={2}
                  name="reason"
                  type="text"
                  value={textInput}
                  onChange={(e) => changeInput(e)}
                />
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
            type="submit"
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
