import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import TruncatedText from "ui/editor/TruncatedText";

import { useStore } from "../../../FlowEditor/lib/store";
import { FlowSummary } from "../../../FlowEditor/lib/store/editor";
import FlowMenu from "../FlowMenu";
import { FlowPinButton } from "../FlowPinButton";
import { FlowTemplateIndicator } from "../FlowTemplateIndicator";
import { useFlowDates } from "../hooks/useFlowDates";
import { useFlowMetadata } from "../hooks/useFlowMetadata";
import {
  Card,
  CardBanner,
  CardContent,
  FlowCardLink,
  LinkSubText,
} from "./styles";

interface Props {
  flow: FlowSummary;
  refreshFlows: () => void;
  showDetails: boolean;
  updateFlow: (updatedFlow: FlowSummary) => void;
}

const FlowCard: React.FC<Props> = ({ flow, refreshFlows, showDetails, updateFlow }) => {
  const [canUserEditTeam, teamSlug, userId] = useStore((state) => [
    state.canUserEditTeam,
    state.teamSlug,
    state.user?.id,
  ]);

  const {
    isSubmissionService,
    isAnyTemplate,
    isSourceTemplate,
    isTemplatedFlow,
    statusVariant,
  } = useFlowMetadata(flow);

  const { displayFormatted } = useFlowDates(flow);

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
            {userId && (
              <FlowPinButton
                flowId={flow.id}
                userId={userId}
                isPinnedByCurrentUser={isPinnedByCurrentUser}
                updateFlow={updateFlow}
              />
            )}
          </Stack>
          {showDetails && (
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
          )}
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
          {showDetails && (
            <FlowCardLink
              to="/app/$team/$flow"
              params={{ team: teamSlug, flow: flow.slug }}
              aria-label={flow.name}
              preload={false}
            />
          )}
        </CardContent>
      </Box>
      {canUserEditTeam(teamSlug) && showDetails && (
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
