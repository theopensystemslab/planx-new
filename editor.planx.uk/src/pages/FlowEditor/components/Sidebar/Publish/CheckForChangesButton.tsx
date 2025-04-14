import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { logger } from "airbrake";
import { AxiosError } from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";

import { HistoryItem } from "../EditHistory";
import { AlteredNode } from "./AlteredNodes";
import { ChangesDialog, NoChangesDialog, TrailAccountDialog } from "./PublishDialog";
import { ValidationCheck } from "./ValidationChecks";

export const CheckForChangesToPublishButton: React.FC<{
  previewURL: string;
}> = ({ previewURL }) => {
  const [
    flowId,
    publishFlow,
    lastPublished,
    lastPublisher,
    validateAndDiffFlow,
    isTrial,
  ] = useStore((state) => [
    state.id,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.validateAndDiffFlow,
    state.teamSettings.isTrial,
  ]);

  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>(
    "This flow is not published yet",
  );
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>(
    [],
  );
  const [alteredNodes, setAlteredNodes] = useState<AlteredNode[]>();
  const [history, setHistory] = useState<HistoryItem[]>();

  const [publishDialogOpen, setPublishDialogOpen] = useState<boolean>(false);
  const [noChangesDialogOpen, setNoChangesDialogOpen] = useState<boolean>(false);
  const [trialAccountDialogOpen, setTrialAccountDialogOpen] = useState<boolean>(false);

  const handleCheckForChangesToPublish = async () => {
    if (isTrial) return setTrialAccountDialogOpen(true);

    try {
      setLastPublishedTitle("Checking for changes...");
      const alteredFlow = await validateAndDiffFlow(flowId);
      setAlteredNodes(
        alteredFlow?.data.alteredNodes ? alteredFlow.data.alteredNodes : [],
      );
      setHistory(alteredFlow?.data?.history ? alteredFlow.data.history : []);
      setLastPublishedTitle(
        alteredFlow?.data.alteredNodes
          ? `Found changes ready to publish`
          : alteredFlow?.data.message,
      );
      setValidationChecks(alteredFlow?.data?.validationChecks);

      if (!alteredNodes || alteredNodes?.length === 0) {
        return setNoChangesDialogOpen(true);
      }
      
      setPublishDialogOpen(true);
    } catch (error) {
      setLastPublishedTitle("Error checking for changes to publish");

      if (error instanceof AxiosError) {
        alert(error.response?.data?.error);
        logger.notify(error);
      } else {
        alert(
          `Error checking for changes to publish. Confirm that your graph does not have any corrupted nodes and that all external portals are valid. \n${error}`,
        );
      }
    }
  };

  const handlePublish = async (summary: string) => {
    try {
      setPublishDialogOpen(false);
      setLastPublishedTitle("Publishing changes...");
      const { alteredNodes, message } = await publishFlow(flowId, summary);
      setLastPublishedTitle(
        alteredNodes
          ? `Successfully published changes`
          : `${message}` || "No new changes to publish",
      );
    } catch (error) {
      setLastPublishedTitle("Error trying to publish");
      alert(error);
    }
  };

  const _lastPublishedRequest = useAsync(async () => {
    const date = await lastPublished(flowId);
    const user = await lastPublisher(flowId);
    setLastPublishedTitle(formatLastPublishMessage(date, user));
  }, [flowId]);

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  return (
    <Box width="100%" mt={2}>
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <Button
          data-testid="check-for-changes-to-publish-button"
          sx={{ width: "100%" }}
          variant="contained"
          color="primary"
          disabled={!useStore.getState().canUserEditTeam(teamSlug)}
          onClick={handleCheckForChangesToPublish}
        >
          CHECK FOR CHANGES TO PUBLISH
        </Button>
        <NoChangesDialog
          dialogOpen={noChangesDialogOpen}
          setDialogOpen={setNoChangesDialogOpen}
        />
        <TrailAccountDialog
          dialogOpen={trialAccountDialogOpen}
          setDialogOpen={setTrialAccountDialogOpen}
        />
        <ChangesDialog
          dialogOpen={publishDialogOpen}
          setDialogOpen={setPublishDialogOpen}
          alteredNodes={alteredNodes!}
          history={history}
          lastPublishedTitle={lastPublishedTitle}
          validationChecks={validationChecks}
          previewURL={previewURL}
          handlePublish={handlePublish}
        />
        <Box mr={0}>
          <Typography variant="caption">{lastPublishedTitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
