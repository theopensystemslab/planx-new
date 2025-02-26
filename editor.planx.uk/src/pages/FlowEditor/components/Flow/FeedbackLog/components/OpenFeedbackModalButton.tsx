import Button from "@mui/material/Button";
import { GridCellParams } from "@mui/x-data-grid";
import React, { useState } from "react";

import { getDetailedFeedback } from "../utils";
import { DetailedFeedbackModal } from "./DetailedFeedbackModal";

export const OpenFeedbackModalButton = (props: GridCellParams) => {
  const { row } = props;

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [detailedFeedback, setDetailedFeedback] = useState<
    Record<string, any> | undefined
  >(undefined);

  const handleButtonClick = async () => {
    setModalIsOpen(!modalIsOpen);
    if (!modalIsOpen && !detailedFeedback) {
      const fetchedData = await getDetailedFeedback(row.id);
      setDetailedFeedback(fetchedData);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleButtonClick}>
        Open detailed feedback
      </Button>
      <DetailedFeedbackModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        feedback={row}
        detailedFeedback={detailedFeedback}
      />
    </>
  );
};
