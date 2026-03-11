import LanguageIcon from "@mui/icons-material/Language";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import { PublishFlowArgs } from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { Template } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";

import { usePublishFlow } from "./hooks/usePublishFlow";
import { ChangesDialog, NoChangesDialog } from "./PublishDialog";

export const CheckForChangesToPublishButton: React.FC<{
  previewURL: string;
  isFlowPublished: boolean;
  publishedURL: string;
}> = ({ previewURL, isFlowPublished, publishedURL }) => {
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

  const isDisabled =
    !useStore.getState().canUserEditTeam(teamSlug) ||
    checkForChangesMutation.isPending ||
    publishMutation.isPending;

  return (
    <>
      <Box width="100%" mt={1}>
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
            <StarIcon sx={{ color: "#380F77", mr: 0.5 }} fontSize="small" />
            <Box>
              <Typography variant="body2">
                {`Templated from ${template.team.name}`}
              </Typography>
              <Typography variant="body2">
                <strong>
                  {isTemplatedFlowDueToPublish
                    ? "Due to review and publish"
                    : "Up to date"}
                </strong>
              </Typography>
            </Box>
          </Box>
        )}
        <Box display="flex" gap={1}>
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
          {isFlowPublished ? (
            <Tooltip title="Open published service">
              <Box
                component="a"
                href={publishedURL}
                target="_blank"
                rel="noopener noreferrer"
                sx={(theme) => ({
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: theme.spacing(0.65),
                  padding: theme.spacing(0.5, 0.75),
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  textDecoration: "none",
                  border: `1px solid ${theme.palette.border.main}`,
                  borderRadius: `${theme.shape.borderRadius}px`,
                  backgroundColor: theme.palette.background.paper,
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  "&:hover": { backgroundColor: theme.palette.action.hover },
                  "& svg": { fontSize: "1.1rem" },
                })}
              >
                <LanguageIcon />
                Open published service
              </Box>
            </Tooltip>
          ) : (
            <Tooltip title="Service not yet published">
              <Box
                sx={(theme) => ({
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: theme.spacing(0.5),
                  padding: theme.spacing(0.5, 0.75),
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: theme.palette.text.disabled,
                  border: `1px solid ${theme.palette.border.main}`,
                  borderRadius: `${theme.shape.borderRadius}px`,
                  backgroundColor: theme.palette.background.paper,
                  opacity: 0.6,
                  cursor: "default",
                  "& svg": { fontSize: "0.875rem" },
                })}
              >
                <LanguageIcon />
                Published
              </Box>
            </Tooltip>
          )}
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
