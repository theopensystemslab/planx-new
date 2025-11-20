import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { SendIntegration } from "@opensystemslab/planx-core/types";
import { useMutation } from "@tanstack/react-query";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { useToast } from "hooks/useToast";
import { createSendEvents } from "lib/api/send/requests";
import type { CombinedEventsPayload } from "lib/api/send/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

import type { Submission } from "../types";

type ResubmitEventType = Exclude<Submission["eventType"], "Pay">;

export const ResubmitButton = (params: RenderCellParams) => {
  const teamSlug = useStore((state) => state.teamSlug);
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isHidden = params.row.eventType === "Pay";

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

  const handleConfirm = (isConfirmed: boolean) => {
    if (!isConfirmed) return setIsDialogOpen(false);

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
    setIsDialogOpen(false);
  };

  const isDisabled = params.row.status === "Success" || isPending || isSuccess;

  if (isHidden) return;

  return (
    <>
      <Tooltip title="Resubmit">
        <IconButton
          disabled={isDisabled}
          aria-label="resubmit application"
          onClick={() => setIsDialogOpen(true)}
        >
          <ReplayIcon />
        </IconButton>
      </Tooltip>
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleConfirm}
        confirmText="Resubmit"
      >
        <Typography>
          You're about to resubmit this application. Have you made the required
          edits to ensure this is a valid payload?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};
