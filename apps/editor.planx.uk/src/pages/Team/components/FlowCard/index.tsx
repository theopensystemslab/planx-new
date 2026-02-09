import Box from "@mui/material/Box";
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
import {
  Card,
  CardBanner,
  CardContent,
  DashboardLink,
  LinkSubText,
} from "./styles";

interface Props {
  flow: FlowSummary;
  flows: FlowSummary[];
  refreshFlows: () => void;
}

const FlowCard: React.FC<Props> = ({ flow, refreshFlows }) => {
  const [canUserEditTeam, teamSlug] = useStore((state) => [
    state.canUserEditTeam,
    state.teamSlug,
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
          <Box>
            <Typography variant="h3" component="h2">
              {flow.name}
            </Typography>
            <LinkSubText>{displayFormatted}</LinkSubText>
          </Box>
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
