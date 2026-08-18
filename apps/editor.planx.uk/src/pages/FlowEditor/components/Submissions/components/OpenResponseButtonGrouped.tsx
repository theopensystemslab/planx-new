import PreviewIcon from "@mui/icons-material/Preview";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { DataTableModal } from "ui/shared/DataTable/components/DataTableModal";

import type { Attempt } from "../types";
import { FormattedResponse } from "./FormattedResponse";

type Props = { attempt: Attempt; sessionId: string };

export const OpenResponseButtonGrouped = (props: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [response, setResponse] = useState<Record<string, any> | null>(null);

  const getResponse = ({ eventType, status, response }: Attempt) => {
    if (eventType === "Pay") return response;
    if (status === "Success") return response?.data?.body;

    return response?.data?.message;
  };

  const handleButtonClick = () => {
    setModalIsOpen(true);
    if (!response) {
      let parsedData = getResponse(props.attempt);
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
        title={`Response for ${props.sessionId || "unknown"}`}
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
