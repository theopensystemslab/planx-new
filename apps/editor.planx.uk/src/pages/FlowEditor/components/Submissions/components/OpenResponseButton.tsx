import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { IconEyeFilled } from "@tabler/icons-react";
import { useState } from "react";
import { Icon } from "ui/icons/Icon";
import { DataTableModal } from "ui/shared/DataTable/components/DataTableModal";

import type { Attempt } from "../types";
import { FormattedResponse } from "./FormattedResponse";

type Props = { attempt: Attempt; sessionId: string; disabled?: boolean };

export const OpenResponseButton = (props: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  if (props.disabled) return;

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
          <Icon icon={IconEyeFilled} />
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
