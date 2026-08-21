import PreviewIcon from "@mui/icons-material/Preview";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { DataTableModal } from "ui/shared/DataTable/components/DataTableModal";

import type { Attempt } from "../types";
import { FormattedResponse } from "./FormattedResponse";

type Props = { attempt: Attempt; sessionId: string };

export const OpenResponseButtonGrouped = (props: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const parseResponse = ({ eventType, status, response }: Attempt) => {
    let data;
    if (eventType === "Pay") data = response;
    else if (status === "Success") data = response?.data?.body;
    else data = response?.data?.message;

    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (error) {
      return {
        error: "Unable to parse response data",
        message: error instanceof Error ? error.message : "Invalid JSON format",
        raw: data,
      };
    }
  };

  return (
    <>
      <Tooltip title="View response">
        <IconButton
          aria-label="View response"
          onClick={() => setModalIsOpen(true)}
        >
          <PreviewIcon />
        </IconButton>
      </Tooltip>
      <DataTableModal
        title={`Response for ${props.sessionId || "unknown"}`}
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      >
        <FormattedResponse response={parseResponse(props.attempt)} />
      </DataTableModal>
    </>
  );
};
