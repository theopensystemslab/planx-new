import Button from "@mui/material/Button";
import { GridCellParams } from "@mui/x-data-grid";
import React, { useState } from "react";

import { Submission } from "../types";
import { ResponseModal } from "./ResponseModal";

export const OpenModalButton = (props: GridCellParams) => {
  const { row } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [response, setResponse] = useState<Record<string, any> | null>(null);

  const getResponse = ({ eventType, status, response }: Submission) => {
    if (eventType === "Pay") return response;
    if (status === "Success") return response?.data?.body;

    return response?.data?.message;
  };

  const handleButtonClick = () => {
    setModalIsOpen(true);
    if (!response) {
      let fetchedData = getResponse(row);
      try {
        fetchedData =
          typeof fetchedData === "string"
            ? JSON.parse(fetchedData)
            : fetchedData;
      } catch (error) {
        fetchedData = { error: "Invalid JSON format", raw: fetchedData };
      }
      setResponse(fetchedData);
    }
  };

  return (
    <>
      <Button variant="text" size="small" onClick={handleButtonClick}>
        View
      </Button>
      <ResponseModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        response={response}
      />
    </>
  );
};
