import PreviewIcon from "@mui/icons-material/Preview";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { GridCellParams } from "@mui/x-data-grid";
import React, { useState } from "react";
import { DataTableModal } from "ui/shared/DataTable/components/DataTableModal";

import type { Attempt, Submission } from "../types";
import { FormattedResponse } from "./FormattedResponse";

type Props = GridCellParams | { attempt: Attempt; sessionId: string };

const isGridCellParams = (props: Props): props is GridCellParams => {
  return "row" in props;
};

export const OpenResponseButton = (props: Props) => {
  const submission = isGridCellParams(props) ? props.row : props.attempt; // TODO: when removing feature flag, conditional isGridCellParams not needed
  const sessionId = isGridCellParams(props)
    ? props.row.sessionId
    : props.sessionId;

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
      let parsedData = getResponse(submission);
      try {
        parsedData =
          typeof parsedData === "string" ? JSON.parse(parsedData) : parsedData;
      } catch (error) {
        parsedData = { error: "Invalid JSON format", raw: parsedData };
      }
      setResponse(parsedData);
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
        title={`Response for ${sessionId || "unknown"}`}
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
