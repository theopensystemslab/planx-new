import PreviewIcon from "@mui/icons-material/Preview";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { GridCellParams } from "@mui/x-data-grid";
import React, { useState } from "react";
import { DataTableModal } from "ui/shared/DataTable/components/DataTableModal";

import { Submission } from "../types";
import { FormattedResponse } from "./FormattedResponse";

export const OpenResponseButton = (props: GridCellParams) => {
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
      <Tooltip title="View response">
        <IconButton aria-label="View response" onClick={handleButtonClick}>
          <PreviewIcon />
        </IconButton>
      </Tooltip>
      <DataTableModal
        title={`Response for ${row.sessionId || "unknown"}`}
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      >
        {response ? (
          <FormattedResponse response={response} />
        ) : (
          <CircularProgress />
        )}
      </DataTableModal>
    </>
  );
};
