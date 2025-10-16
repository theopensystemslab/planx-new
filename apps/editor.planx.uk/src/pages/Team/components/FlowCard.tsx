import MoreHoriz from "@mui/icons-material/MoreHoriz";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import { Link } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD, inputFocusStyle } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import SimpleMenu from "ui/editor/SimpleMenu";

import {
  formatLastEditMessage,
  formatLastPublishMessage,
} from "../../FlowEditor/utils";
import { FlowDialogs } from "./FlowDialogs";
import { useFlowActions } from "./hooks/useFlowActions";
import { useFlowSortDisplay } from "./hooks/useFlowSortDisplay";

export const Card = styled("li")(({ theme }) => ({
  listStyle: "none",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "stretch",
  borderRadius: "3px",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  boxShadow: "0 2px 6px 1px rgba(0, 0, 0, 0.1)",
}));

export const CardBanner = styled(Box)(({ theme }) => ({
  width: "100%",
  background: theme.palette.template.main,
  padding: theme.spacing(0.5, 2),
  borderBottom: `1px solid ${theme.palette.border.main}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.4),
}));

export const CardContent = styled(Box)(({ theme }) => ({
  height: "100%",
  textDecoration: "none",
  color: "currentColor",
  padding: theme.spacing(2, 2, 1.5),
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  margin: 0,
  width: "100%",
}));

const DashboardLink = styled(Link)(() => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  "&:focus": {
    ...inputFocusStyle,
  },
}));

const LinkSubText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: "normal",
  paddingTop: theme.spacing(0.75),
}));

const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  marginTop: "auto",
  borderTop: `1px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  borderRadius: "0px 0px 4px 4px",
  maxHeight: "35px",
  "& > button": {
    padding: theme.spacing(0.25, 1),
    width: "100%",
    justifyContent: "flex-start",
    "& > svg": {
      display: "none",
    },
  },
}));

interface FlowCardProps {
  flow: FlowSummary;
  flows: FlowSummary[];
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
}

const FlowCard: React.FC<FlowCardProps> = ({
  flow,
  teamSlug,
  refreshFlows,
}) => {
  const { showPublished } = useFlowSortDisplay();

  const {
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isCopyDialogOpen,
    isRenameDialogOpen,
    handleArchive,
    handleCopyDialogClose,
    handleRenameDialogClose,
    isSubmissionService,
    isTemplatedFlow,
    isSourceTemplate,
    isAnyTemplate,
    statusVariant,
    menuItems,
    canUserEditTeam,
  } = useFlowActions(flow, teamSlug, refreshFlows);

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

  const publishedDate = formatLastPublishMessage(
    flow.publishedFlows[0]?.publishedAt,
  );
  const editedDate = formatLastEditMessage(
    flow.operations[0]?.createdAt,
    flow.operations[0]?.actor,
  );

  const displayDate = showPublished ? publishedDate : editedDate;

  return (
    <>
      <FlowDialogs
        flow={flow}
        isArchiveDialogOpen={isArchiveDialogOpen}
        setIsArchiveDialogOpen={setIsArchiveDialogOpen}
        isCopyDialogOpen={isCopyDialogOpen}
        isRenameDialogOpen={isRenameDialogOpen}
        handleArchive={handleArchive}
        handleCopyDialogClose={handleCopyDialogClose}
        handleRenameDialogClose={handleRenameDialogClose}
      />
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
              <LinkSubText>{displayDate}</LinkSubText>
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
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ "& > a": { position: "relative", zIndex: 2 } }}
              >
                {`${flow.summary.split(" ").slice(0, 12).join(" ")}... `}
                <Link href={`./${flow.slug}/about`}>read more</Link>
              </Typography>
            )}
            <DashboardLink
              aria-label={flow.name}
              href={`./${flow.slug}`}
              prefetch={false}
            />
          </CardContent>
        </Box>
        {canUserEditTeam && (
          <StyledSimpleMenu items={menuItems}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
              <MoreHoriz sx={{ fontSize: "1.4em" }} />
              <Typography variant="body2" fontSize="small">
                <strong>Menu</strong>
              </Typography>
            </Box>
          </StyledSimpleMenu>
        )}
      </Card>
    </>
  );
};

export default FlowCard;
