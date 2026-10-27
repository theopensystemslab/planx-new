import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { millisecondsToMinutes } from "date-fns/millisecondsToMinutes";
import { useToast } from "hooks/useToast";
import type { PublishFlowArgs } from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import type { Template } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { StatusMarker } from "ui/editor/StatusMarker";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

import { useTemplatedFlowCustomisations } from "../Customisations/hooks/useTemplatedFlowCustomisations";
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
    isTemplate,
    template,
    showLoading,
    hideLoading,
    setLoadingCompleteCallback,
    teamSlug,
  ] = useStore((state) => [
    state.isTemplatedFrom,
    state.isTemplate,
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
      if (isTemplate && args.templatedFlowIds?.length) {
        // When publishing a source template, warn about withholding editing
        //   while templated flows are being updated async (cautiously allow 30s per templated flow)
        const templatedFlowUpdateLagMS = args.templatedFlowIds.length * 30_000;
        toast.warning(
          `Successfully published source template. It will take ${Math.ceil(millisecondsToMinutes(templatedFlowUpdateLagMS))} minutes to update templated flows. Please do not make further changes to this flow during this time.`,
          templatedFlowUpdateLagMS,
        );
      } else {
        toast.success("Successfully published changes");
      }

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

  const [isPattern, flowSlug] = useStore((state) => [
    state.isPattern,
    state.flowSlug,
  ]);

  const { required, outstanding, loading } = useTemplatedFlowCustomisations();

  const hasRequiredCustomisations = required > 0;

  const getCustomisationStatusText = () => {
    if (loading) return "Checking required nodes...";
    if (outstanding === 0) return "All required nodes customised";
    return `${outstanding} ${outstanding === 1 ? "node" : "nodes"} to customise`;
  };

  const customisationStatusText = getCustomisationStatusText();

  const isDisabled =
    !useStore.getState().canUserEditTeam(teamSlug) ||
    loading ||
    outstanding > 0 ||
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
              <Typography variant="body2">
                Templated from {template.team.name}
              </Typography>
              <Stack spacing={0.25} sx={{ mt: 0.5, ml: -0.25 }}>
                <Box sx={{ display: "flex", gap: 0.5 }}>
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
                    <StatusMarker isComplete={!loading && outstanding === 0} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                    >
                      {customisationStatusText}
                      {!loading && outstanding > 0 && !isCustomiseTabOpen && (
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
                {"Control whether this pattern is available to editors in "}
                <CustomLink
                  to="/app/$team/$flow/settings/visibility"
                  params={{ team: teamSlug, flow: flowSlug }}
                  variant="body2"
                >
                  Pattern availability
                </CustomLink>
                {" settings."}
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
