import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { AxiosError } from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";
import Input from "ui/shared/Input";

import {
  AlteredNode,
  AlteredNodesSummaryContent,
  ValidationCheck,
  ValidationChecks,
} from "./PublishDialog";

export const PublishFlowButton: React.FC<{ previewURL: string }> = ({
  previewURL,
}) => {
  const [
    flowId,
    publishFlow,
    lastPublished,
    lastPublisher,
    validateAndDiffFlow,
  ] = useStore((state) => [
    state.id,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.validateAndDiffFlow,
  ]);

  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>(
    "This flow is not published yet",
  );
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>(
    [],
  );
  const [alteredNodes, setAlteredNodes] = useState<AlteredNode[]>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>();

  const handleCheckForChangesToPublish = async () => {
    try {
      setLastPublishedTitle("Checking for changes...");
      const alteredFlow = await validateAndDiffFlow(flowId);
      setAlteredNodes(
        alteredFlow?.data.alteredNodes ? alteredFlow.data.alteredNodes : [],
      );
      setLastPublishedTitle(
        alteredFlow?.data.alteredNodes
          ? `Found changes to ${alteredFlow.data.alteredNodes.length} nodes`
          : alteredFlow?.data.message,
      );
      setValidationChecks(alteredFlow?.data?.validationChecks);
      setDialogOpen(true);
    } catch (error) {
      setLastPublishedTitle("Error checking for changes to publish");

      if (error instanceof AxiosError) {
        alert(error.response?.data?.error);
      } else {
        alert(
          `Error checking for changes to publish. Confirm that your graph does not have any corrupted nodes and that all external portals are valid. \n${error}`,
        );
      }
    }
  };

  const handlePublish = async () => {
    try {
      setDialogOpen(false);
      setLastPublishedTitle("Publishing changes...");
      const { alteredNodes, message } = await publishFlow(flowId, summary);
      setLastPublishedTitle(
        alteredNodes
          ? `Successfully published changes to ${alteredNodes.length} nodes`
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
  });

  const _validateAndDiffRequest = useAsync(async () => {
    const newChanges = await validateAndDiffFlow(flowId);
    setAlteredNodes(
      newChanges?.data.alteredNodes ? newChanges.data.alteredNodes : [],
    );
  });

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  return (
    <Box width="100%" mt={2}>
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <Badge
          sx={{ width: "100%" }}
          badgeContent={alteredNodes && alteredNodes.length}
          max={999}
          color="warning"
        >
          <Button
            sx={{ width: "100%" }}
            variant="contained"
            color="primary"
            disabled={!useStore.getState().canUserEditTeam(teamSlug)}
            onClick={handleCheckForChangesToPublish}
          >
            CHECK FOR CHANGES TO PUBLISH
          </Button>
        </Badge>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
        >
          <DialogTitle variant="h3" component="h1">
            {`Check for changes to publish`}
          </DialogTitle>
          <DialogContent>
            {alteredNodes?.length ? (
              <>
                <AlteredNodesSummaryContent
                  alteredNodes={alteredNodes}
                  lastPublishedTitle={lastPublishedTitle}
                />
                <ValidationChecks validationChecks={validationChecks} />
                <Box pb={2}>
                  <Typography variant="body2">
                    {`Preview these content changes in-service before publishing `}
                    <Link href={previewURL} target="_blank">
                      {`here (opens in a new tab).`}
                    </Link>
                  </Typography>
                </Box>
                <Input
                  bordered
                  type="text"
                  name="summary"
                  value={summary || ""}
                  placeholder="Summarise your changes..."
                  onChange={(e) => setSummary(e.target.value)}
                />
              </>
            ) : (
              <Typography variant="body2">
                {`No new changes to publish`}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ paddingX: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>KEEP EDITING</Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handlePublish}
              disabled={
                !alteredNodes ||
                alteredNodes.length === 0 ||
                validationChecks.filter((v) => v.status === "Fail").length > 0
              }
            >
              PUBLISH
            </Button>
          </DialogActions>
        </Dialog>
        <Box mr={0}>
          <Typography variant="caption">{lastPublishedTitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
