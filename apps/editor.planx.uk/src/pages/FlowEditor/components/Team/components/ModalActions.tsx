import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useFormikContext } from "formik";
import React from "react";

export const ModalActions = ({
  submitDataTestId,
  submitButtonText,
  isSubmitting,
  onCancel,
}: {
  submitDataTestId: string;
  submitButtonText: string;
  isSubmitting: boolean;
  onCancel: () => void;
}) => {
  const { dirty, isValid } = useFormikContext();

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
      <Button
        variant="contained"
        color="secondary"
        type="reset"
        onClick={onCancel}
        data-testid="modal-cancel-button"
        sx={{ backgroundColor: "background.default" }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="prompt"
        type="submit"
        data-testid={submitDataTestId}
        disabled={!dirty || !isValid || isSubmitting}
      >
        {submitButtonText}
      </Button>
    </Box>
  );
};