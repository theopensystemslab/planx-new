import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";
import { AxiosError } from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import BlockQuote from "ui/editor/BlockQuote";

import { HistoryItem } from "../EditHistory";
import { AlteredNode } from "./AlteredNodes";
import { ChangesDialog, NoChangesDialog } from "./PublishDialog";
import { ValidationCheck } from "./ValidationChecks";

export type TemplatedFlows = {
  id: string;
  slug: string;
  team: {
    slug: string;
  };
  status: FlowStatus;
}[];

export const CheckForChangesToPublishButton: React.FC<{
  previewURL: string;
}> = ({ previewURL }) => {
  const [
    flowId,
    publishFlow,
    lastPublished,
    lastPublisher,
    validateAndDiffFlow,
    isTemplate,
    isTemplatedFrom,
    template,
  ] = useStore((state) => [
    state.id,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.validateAndDiffFlow,
    state.isTemplate,
    state.isTemplatedFrom,
    state.template,
  ]);

  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>(
    "This flow is not published yet",
  );
  const [templateLastPublishedTitle, setTemplateLastPublishedTitle] =
    useState<string>();
  const [isTemplatedFlowDueToPublish, setIsTemplatedFlowDueToPublish] =
    useState<boolean>(false);

  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>(
    [],
  );
  const [alteredNodes, setAlteredNodes] = useState<AlteredNode[]>();
  const [history, setHistory] = useState<HistoryItem[]>();
  const [templatedFlows, setTemplatedFlows] = useState<TemplatedFlows>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleCheckForChangesToPublish = async () => {
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
      setTemplatedFlows(alteredFlow?.data?.templatedFlows);
      setDialogOpen(true);
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

  const handlePublish = async (
    summary: string,
    templatedFlowIds?: string[],
  ) => {
    try {
      setDialogOpen(false);
      setLastPublishedTitle("Publishing changes...");
      const { alteredNodes, message } = await publishFlow(
        flowId,
        summary,
        templatedFlowIds,
      );
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

    if (template) {
      const sourceTemplateUser = await lastPublisher(template.id);
      const sourceTemplateDate = template.publishedFlows[0].publishedAt;
      setTemplateLastPublishedTitle(
        formatLastPublishMessage(sourceTemplateDate, sourceTemplateUser),
      );

      if (date) {
        setIsTemplatedFlowDueToPublish(sourceTemplateDate > date);
      }
    }
  }, [flowId, template]);

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  return (
    <Box width="100%" mt={2}>
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        {isTemplatedFrom && template && (
          <Box
            sx={{
              background: (theme) => theme.palette.template.main,
              border: (theme) => `1px solid ${theme.palette.border.main}`,
              width: "100%",
              padding: (theme) => theme.spacing(1),
              marginBottom: (theme) => theme.spacing(2),
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              <StarIcon sx={{ color: "#380F77" }} />
              {`Templated from ${template.team.name}`}
            </Typography>
            <Typography variant="body2">
              {templateLastPublishedTitle}
            </Typography>
            <BlockQuote>{template.publishedFlows[0]?.summary}</BlockQuote>
            <Typography
              variant="body2"
              mt={2}
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              {isTemplatedFlowDueToPublish
                ? `Your templated flow is due for review and publish.`
                : `Your templated flow is up to date with the source.`}
            </Typography>
          </Box>
        )}
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
        {!alteredNodes || alteredNodes?.length === 0 ? (
          <NoChangesDialog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
          />
        ) : (
          <ChangesDialog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            alteredNodes={alteredNodes}
            history={history}
            lastPublishedTitle={lastPublishedTitle}
            validationChecks={validationChecks}
            previewURL={previewURL}
            handlePublish={handlePublish}
            isTemplate={isTemplate}
            templatedFlows={templatedFlows}
          />
        )}
        <Box mr={0}>
          <Typography variant="caption">{lastPublishedTitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
