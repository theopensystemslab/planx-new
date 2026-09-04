import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { SendIntegration } from "@opensystemslab/planx-core/types";
import { useMutation } from "@tanstack/react-query";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { useToast } from "hooks/useToast";
import { createSendEvents } from "lib/api/send/requests";
import type { CombinedEventsPayload } from "lib/api/send/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useState } from "react";

import type { Submission } from "../types";

type ResubmitEventType = Exclude<
  Submission["eventType"],
  "Pay" | "Started session" | "Invited to pay"
>;

type Props = {
  sessionId: string;
  eventType: Submission["eventType"];
};

export const ResubmitButton = (props: Props) => {
  const teamSlug = useStore((state) => state.teamSlug);
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate } = useMutation({
    mutationFn: createSendEvents,
    onSuccess: () =>
      toast.success(`Created new send event for session ${props.sessionId}`),
    onError: () =>
      toast.error(
        `Failed to create new sent event for session ${props.sessionId}`,
      ),
  });

  const handleConfirm = (isConfirmed: boolean) => {
    if (!isConfirmed) return setIsDialogOpen(false);

    const destinationMap: Record<ResubmitEventType, SendIntegration> = {
      "Submit to BOPS": "bops",
      "Submit to Uniform": "uniform",
      "Send to email": "email",
      "Upload to AWS S3": "s3",
      "Upload to AWS S3 (no notification)": "fme",
      "Submit to Idox Nexus": "idox",
    };

    const destination = destinationMap[props.eventType as ResubmitEventType];

    if (!destination) return;

    const payload: CombinedEventsPayload = {
      [destination]: {
        localAuthority: teamSlug,
        body: {
          sessionId: props.sessionId,
        },
      },
    };

    mutate({ sessionId: props.sessionId, ...payload });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        aria-label="resubmit application"
        onClick={() => setIsDialogOpen(true)}
        variant="link"
        sx={{ alignSelf: "start", color: "link.main" }}
      >
        <Typography sx={{ fontWeight: "bold" }}>
          {props.eventType
            .replace("Send", "Resubmit")
            .replace("Submit", "Resubmit")
            .replace("Upload", "Resubmit")}
        </Typography>
      </Button>
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
