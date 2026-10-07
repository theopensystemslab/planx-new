import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import type { PublishFlowArgs } from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import type { Template } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { StatusMarker } from "ui/editor/StatusMarker";

import { OpenServiceMenu } from "../OpenServiceMenu";
import { usePublishFlow } from "./hooks/usePublishFlow";
import { ChangesDialog, NoChangesDialog } from "./PublishDialog";

export const CheckForChangesToPublishButton: React.FC<{
  previewURL: string;
  isCustomiseTabOpen: boolean;
  onViewCustomisations: () => void;
}> = ({ previewURL, isCustomiseTabOpen, onViewCustomisations }) => {
  const [
    isTemplatedFrom,
    template,
    showLoading,
    hideLoading,
    setLoadingCompleteCallback,
    teamSlug,
  ] = useStore((state) => [
    state.isTemplatedFrom,
    state.template,
    state.showLoading,
    state.hideLoading,
    state.setLoadingCompleteCallback,
    state.getTeam().slug,
  ]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const toast = useToast();
  const {
    lastPublishedQuery,
    checkForChangesMutation,
    publishMutation,
    status,
    buttonText,
  } = usePublishFlow();

  const handleCheckForChangesToPublish = async () =>
    checkForChangesMutation.mutate(undefined, {
      onSuccess: () => setDialogOpen(true),
    });

  const handlePublish = async (args: PublishFlowArgs) => {
    // Close modal immediately, user feedback handled via status text beneath to publish button
    setDialogOpen(false);

    setLoadingCompleteCallback(() => {
      toast.success("Successfully published changes");
      setLoadingCompleteCallback(undefined);
    });

    showLoading("Publishing flow");

    publishMutation.mutate(args, {
      onSuccess: () => {
        hideLoading();
      },
      onError: () => {
        setLoadingCompleteCallback(undefined);
        hideLoading();
      },
    });
  };

  const {
    alteredNodes = [],
    history = [],
    validationChecks = [],
    templatedFlows = [],
  } = checkForChangesMutation.data || {};

  const isTemplateUpdateRequired = (
    template: Template | undefined,
    lastPublishedData: typeof lastPublishedQuery.data,
  ) => {
    const lastPublishedDate = lastPublishedData?.date;

    if (!template || !lastPublishedDate) return false;

    const sourceTemplateDate = template.publishedFlows?.[0]?.publishedAt;
    if (!sourceTemplateDate) return false;

    return new Date(sourceTemplateDate) > new Date(lastPublishedDate);
  };

  const isTemplatedFlowDueToPublish = isTemplateUpdateRequired(
    template,
    lastPublishedQuery.data,
  );

  const [
    isPattern,
    flowStatus,
    outstandingTemplatedFlowCustomisations,
    orderedFlow,
  ] = useStore((state) => [
    state.isPattern,
    state.flowStatus,
    state.outstandingTemplatedFlowCustomisations,
    state.orderedFlow,
  ]);

  // Derived from the flow itself (not flow edits), so never stale and needs no reset
  const hasRequiredCustomisations = Boolean(
    orderedFlow?.some(
      (node) =>
        node.data?.isTemplatedNode &&
        node.data?.areTemplatedNodeInstructionsRequired === true,
    ),
  );

  const isDisabled =
    !useStore.getState().canUserEditTeam(teamSlug) ||
    outstandingTemplatedFlowCustomisations > 0 ||
    isPattern ||
    checkForChangesMutation.isPending ||
    publishMutation.isPending;

  return (
    <>
      <Box sx={{ width: "100%" }}>
        {isTemplatedFrom && template && (
          <Box
            sx={{
              background: (theme) => theme.palette.template.main,
              width: "100%",
              padding: (theme) => theme.spacing(1),
              marginBottom: (theme) => theme.spacing(1),
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <StarIcon
              sx={{ color: "template.icon", mr: 0.5 }}
              fontSize="small"
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
              >
                {template.team.name}
              </Typography>
              <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    Template
                  </Typography>
                  <StatusMarker isComplete={!isTemplatedFlowDueToPublish} />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    {isTemplatedFlowDueToPublish
                      ? "Due to review and publish"
                      : "Up to date"}
                  </Typography>
                </Box>
                {hasRequiredCustomisations && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      Customise
                    </Typography>
                    <StatusMarker
                      isComplete={outstandingTemplatedFlowCustomisations === 0}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                    >
                      {outstandingTemplatedFlowCustomisations === 0
                        ? "All required nodes customised"
                        : `${outstandingTemplatedFlowCustomisations} ${outstandingTemplatedFlowCustomisations === 1 ? "node" : "nodes"} to customise`}
                      {outstandingTemplatedFlowCustomisations > 0 &&
                        !isCustomiseTabOpen && (
                          <>
                            {" "}
                            <Link
                              component="button"
                              variant="body2"
                              onClick={onViewCustomisations}
                              sx={{ verticalAlign: "baseline" }}
                            >
                              view
                            </Link>
                          </>
                        )}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        )}
        {isPattern && (
          <Box
            sx={{
              background: (theme) => theme.palette.pattern.dark,
              width: "100%",
              padding: (theme) => theme.spacing(1),
              marginBottom: (theme) => theme.spacing(1),
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="body2">
                <strong>{`This flow is a pattern`}</strong>
              </Typography>
              <Typography variant="body2">
                {`Patterns are made available to team editors when adding components only. This pattern is ${flowStatus} and therefore ${flowStatus === "online" ? "discoverable" : "not discoverable yet"}.`}
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            data-testid="check-for-changes-to-publish-button"
            sx={{ flex: 1 }}
            variant="contained"
            color="primary"
            disabled={isDisabled}
            onClick={handleCheckForChangesToPublish}
            startIcon={
              checkForChangesMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {buttonText}
          </Button>
          <OpenServiceMenu />
        </Box>
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
            status={status}
            validationChecks={validationChecks}
            previewURL={previewURL}
            handlePublish={handlePublish}
            templatedFlows={templatedFlows}
          />
        )}
        <Typography variant="caption">{status}</Typography>
      </Box>
    </>
  );
};
