import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { SendIntegration } from "@opensystemslab/planx-core/types";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "hooks/useToast";
import { createSendEvents } from "lib/api/send/requests";
import type { CombinedEventsPayload } from "lib/api/send/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

import type { Submission } from "../types";

type ResubmitEventType = Exclude<Submission["eventType"], "Pay">;

export const ResubmitButton = (params: RenderCellParams) => {
  const teamSlug = useStore((state) => state.teamSlug);
  const isHidden = params.row.eventType === "Pay";
  const toast = useToast();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: createSendEvents,
    onSuccess: () =>
      toast.success(
        `Created new send event for session ${params.row.sessionId}`,
      ),
    onError: () =>
      toast.error(
        `Failed to create new sent event for session ${params.row.sessionId}`,
      ),
  });

  const handleResubmit = () => {
    const destinationMap: Record<ResubmitEventType, SendIntegration> = {
      "Submit to BOPS": "bops",
      "Submit to Uniform": "uniform",
      "Send to email": "email",
      "Upload to AWS S3": "s3",
    };

    const destination =
      destinationMap[params.row.eventType as ResubmitEventType];

    if (!destination) return;

    const payload: CombinedEventsPayload = {
      [destination]: {
        localAuthority: teamSlug,
        body: {
          sessionId: params.row.sessionId,
        },
      },
    };

    mutate({ sessionId: params.row.sessionId, ...payload });
  };

  const isDisabled = params.row.status === "Success" || isPending || isSuccess;

  if (isHidden) return;

  return (
    <Tooltip title="Resubmit">
      <IconButton
        disabled={isDisabled}
        aria-label="resubmit application"
        onClick={handleResubmit}
      >
        <ReplayIcon />
      </IconButton>
    </Tooltip>
  );
};
