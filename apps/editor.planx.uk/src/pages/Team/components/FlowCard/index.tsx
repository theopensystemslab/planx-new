import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link, useSearch } from "@tanstack/react-router";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import { getSortParams } from "ui/editor/SortControl/utils";

import { useStore } from "../../../FlowEditor/lib/store";
import { FlowSummary } from "../../../FlowEditor/lib/store/editor";
import {
  formatLastEditMessage,
  formatLastPublishMessage,
} from "../../../FlowEditor/utils";
import { sortOptions } from "../../helpers/sortAndFilterOptions";
import FlowCardMenu from "./Menu";
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
  const searchParams = useSearch({ from: "/_authenticated/$team/" });

  const {
    sortObject: { displayName: sortDisplayName },
  } = getSortParams<FlowSummary>(searchParams, sortOptions);

  const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;
  const isTemplatedFlow = Boolean(flow.templatedFrom);
  const isSourceTemplate = flow.isTemplate;
  const isAnyTemplate = isTemplatedFlow || isSourceTemplate;

  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

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
    {
      type: FlowTagType.Templated,
      displayName: "Templated",
      shouldAddTag: isTemplatedFlow,
    },
    {
      type: FlowTagType.SourceTemplate,
      displayName: "Source template",
      shouldAddTag: isSourceTemplate,
    },
  ];

  const publishedDate = formatLastPublishMessage(
    flow.publishedFlows[0]?.publishedAt,
  );
  const editedDate = formatLastEditMessage(
    flow.operations[0]?.createdAt,
    flow.operations[0]?.actor,
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
            {isTemplatedFlow && (
              <StarIcon sx={{ color: "#380F77", fontSize: "0.8em" }} />
            )}
            <Typography
              variant="body2"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              {isSourceTemplate
                ? "Source template"
                : `Templated from ${flow.template.team.name}`}
            </Typography>
          </CardBanner>
        )}
        <CardContent>
          <Box>
            <Typography variant="h3" component="h2">
              {flow.name}
            </Typography>
            <LinkSubText>
              {sortDisplayName === "Last published"
                ? publishedDate
                : editedDate}
            </LinkSubText>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {displayTags
              .filter(
                (tag) =>
                  tag.shouldAddTag &&
                  tag.type !== FlowTagType.Templated &&
                  tag.type !== FlowTagType.SourceTemplate,
              )
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
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ "& > a": { position: "relative", zIndex: 2 } }}
            >
              {`${flow.summary.split(" ").slice(0, 12).join(" ")}... `}
              <Link
                to="/$team/$flow/about"
                params={{ team: teamSlug, flow: flow.slug }}
              >
                read more
              </Link>{" "}
            </Typography>
          )}
          <DashboardLink
            aria-label={flow.name}
            href={`./${flow.slug}`}
            prefetch={false}
          />
        </CardContent>
      </Box>
      {canUserEditTeam(teamSlug) && (
        <FlowCardMenu
          flow={flow}
          refreshFlows={refreshFlows}
          isAnyTemplate={isAnyTemplate}
        />
      )}
    </Card>
  );
};

export default FlowCard;
