import { useMutation } from "@apollo/client/react";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import TruncatedText from "ui/editor/TruncatedText";

import { useStore } from "../../../FlowEditor/lib/store";
import { FlowSummary } from "../../../FlowEditor/lib/store/editor";
import FlowMenu from "../FlowMenu";
import { FlowTemplateIndicator } from "../FlowTemplateIndicator";
import { useFlowDates } from "../hooks/useFlowDates";
import { useFlowMetadata } from "../hooks/useFlowMetadata";
import { PIN_FLOW, UNPIN_FLOW } from "./queries";
import {
  Card,
  CardBanner,
  CardContent,
  DashboardLink,
  LinkSubText,
} from "./styles";

interface Props {
  flow: FlowSummary;
  refreshFlows: () => void;
  updateFlow: (updatedFlow: FlowSummary) => void;
}

const FlowCard: React.FC<Props> = ({ flow, refreshFlows, updateFlow }) => {
  const [canUserEditTeam, teamSlug, user] = useStore((state) => [
    state.canUserEditTeam,
    state.teamSlug,
    state.user,
  ]);

  const {
    isSubmissionService,
    isAnyTemplate,
    isSourceTemplate,
    isTemplatedFlow,
    statusVariant,
  } = useFlowMetadata(flow);

  const { displayFormatted } = useFlowDates(flow);

  const [pinFlow, { loading: isPinLoading }] = useMutation<{
    insert_user_pinned_flows_one: { flow: FlowSummary };
  }>(PIN_FLOW);

  const [unpinFlow, { loading: isUnpinLoading }] = useMutation<{
    delete_user_pinned_flows: { returning: { flow: FlowSummary }[] };
  }>(UNPIN_FLOW);

  const displayTags = [
    {
      type: FlowTagType.Status,
      displayName: statusVariant,
      shouldAddTag: true,
    },
    {
      type: FlowTagType.ServiceType,
      displayName: "Submission",
      shouldAddTag: isSubmissionService,
    },
  ];

  const handlePinFlow = async () => {
    if (!user) return;

    const result = await pinFlow({
      variables: { flowId: flow.id, userId: user.id },
    });
    const updatedFlow = result.data?.insert_user_pinned_flows_one?.flow;
    if (updatedFlow) updateFlow(updatedFlow);
  };

  const handleUnpinFlow = async () => {
    const result = await unpinFlow({ variables: { flowId: flow.id } });
    const updatedFlow =
      result.data?.delete_user_pinned_flows?.returning?.[0]?.flow;
    if (updatedFlow) updateFlow(updatedFlow);
  };

  const isPinnedByCurrentUser = flow.pinnedFlows.some(
    (f) => f.flowId === flow.id,
  );

  return (
    <Card>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isAnyTemplate && (
          <CardBanner>
            <FlowTemplateIndicator
              isSourceTemplate={isSourceTemplate}
              isTemplatedFlow={isTemplatedFlow}
              teamName={flow.template?.team.name}
            />
          </CardBanner>
        )}
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            width="100%"
          >
            <Stack direction="column" alignItems="flex-start">
              <Typography variant="h3" component="h2">
                {flow.name}
              </Typography>
              <LinkSubText>{displayFormatted}</LinkSubText>
            </Stack>

            <Box sx={{ position: "relative", zIndex: 2 }}>
              {(isPinLoading || isUnpinLoading) && (
                <CircularProgress
                  size={34}
                  disableShrink
                  thickness={1}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    animationDuration: "700ms",
                  }}
                />
              )}
              {isPinnedByCurrentUser ? (
                <Tooltip title="Unpin flow">
                  <IconButton
                    size="small"
                    onClick={handleUnpinFlow}
                    aria-label="Unpin flow"
                    sx={{ borderRadius: "50%" }}
                  >
                    <StarIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Pin flow">
                  <IconButton
                    size="small"
                    onClick={handlePinFlow}
                    aria-label="Pin flow"
                    disabled={!user}
                    sx={{ borderRadius: "50%" }}
                  >
                    <StarOutlineIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Stack>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {displayTags
              .filter((tag) => tag.shouldAddTag)
              .map((tag) => (
                <FlowTag
                  key={`${tag.displayName}-flowtag`}
                  tagType={tag.type}
                  statusVariant={statusVariant}
                >
                  {tag.displayName}
                </FlowTag>
              ))}
          </Box>
          {flow.summary && (
            <TruncatedText
              variant="body2"
              color="textSecondary"
              lineClamp={2}
              sx={{ "& > a": { position: "relative", zIndex: 2 } }}
            >
              {flow.summary}
            </TruncatedText>
          )}
          <DashboardLink
            to="/app/$team/$flow"
            params={{ team: teamSlug, flow: flow.slug }}
            aria-label={flow.name}
            preload={false}
          />
        </CardContent>
      </Box>
      {canUserEditTeam(teamSlug) && (
        <FlowMenu
          flow={flow}
          refreshFlows={refreshFlows}
          isAnyTemplate={isAnyTemplate}
          variant="card"
        />
      )}
    </Card>
  );
};

export default FlowCard;
