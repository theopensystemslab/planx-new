import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { type LinkOptions, useNavigate } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import TruncatedText from "ui/editor/TruncatedText";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

import { useStore } from "../../../FlowEditor/lib/store";
import FlowMenu from "../FlowMenu";
import { FlowTemplateIndicator } from "../FlowTemplateIndicator";
import { useFlowDates } from "../hooks/useFlowDates";
import { useFlowMetadata } from "../hooks/useFlowMetadata";
import { useFlowSortDisplay } from "../hooks/useFlowSortDisplay";
import {
  FlowActionsCell,
  FlowStatusCell,
  FlowTitleCell,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
} from "./styles";

interface FlowTableProps {
  flows: FlowSummary[];
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
}

export const FlowTable: React.FC<FlowTableProps> = ({
  flows,
  teamSlug,
  refreshFlows,
}) => {
  const { headerText } = useFlowSortDisplay();

  return (
    <StyledTable>
      <StyledTableHead>
        <TableRow>
          <FlowTitleCell>Flow title</FlowTitleCell>
          <FlowStatusCell>Online status</FlowStatusCell>
          <FlowStatusCell>Flow type</FlowStatusCell>
          <TableCell>{headerText}</TableCell>
          <FlowActionsCell align="center">Actions</FlowActionsCell>
        </TableRow>
      </StyledTableHead>
      <TableBody>
        {flows.map((flow) => (
          <FlowTableRow
            key={flow.slug}
            flow={flow}
            teamSlug={teamSlug}
            refreshFlows={refreshFlows}
          />
        ))}
      </TableBody>
    </StyledTable>
  );
};

interface FlowTableRowProps {
  flow: FlowSummary;
  teamSlug: string;
  refreshFlows: () => void;
}

const FlowTableRow: React.FC<FlowTableRowProps> = ({
  flow,
  teamSlug,
  refreshFlows,
}) => {
  const router = useRouter();
  const navigate = useNavigate();
  const [canUserEditTeam] = useStore((state) => [state.canUserEditTeam]);

  const {
    isSubmissionService,
    isAnyTemplate,
    isSourceTemplate,
    isTemplatedFlow,
    statusVariant,
  } = useFlowMetadata(flow);

  const { displayTimeAgo, displayActor } = useFlowDates(flow);

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;

    const destination: LinkOptions = {
      to: "/team/$team/$flow",
      params: { team: teamSlug, flow: flow.slug },
    };

    // Allow links to be opened in new tabs
    if (e.metaKey || e.ctrlKey) {
      const { href } = router.buildLocation(destination);
      window.open(href, "_blank");
      return;
    }

    navigate(destination);
  };

  return (
    <StyledTableRow isTemplated={isAnyTemplate} onClick={handleRowClick}>
      <FlowTitleCell>
        <Box>
          {isAnyTemplate && (
            <Box sx={{ mb: 0.5 }}>
              <FlowTemplateIndicator
                isSourceTemplate={isSourceTemplate}
                isTemplatedFlow={isTemplatedFlow}
                teamName={flow.template?.team.name}
              />
            </Box>
          )}
          <CustomLink
            to="/team/$team/$flow"
            params={{ team: teamSlug, flow: flow.slug }}
            onClick={(e) => e.stopPropagation()}
            sx={(theme) => ({
              textDecoration: "none",
              color: theme.palette.text.primary,
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
              "&:hover": {
                textDecoration: "underline",
              },
            })}
          >
            <Typography variant="h4" component="span">
              {flow.name}
            </Typography>
          </CustomLink>
          {flow.summary && (
            <TruncatedText
              variant="body2"
              color="textSecondary"
              lineClamp={2}
              pt={0.5}
            >
              {flow.summary}
            </TruncatedText>
          )}
        </Box>
      </FlowTitleCell>
      <FlowStatusCell>
        <Box sx={{ display: "inline-flex" }}>
          <FlowTag tagType={FlowTagType.Status} statusVariant={statusVariant}>
            {statusVariant}
          </FlowTag>
        </Box>
      </FlowStatusCell>
      <FlowStatusCell>
        {isSubmissionService && (
          <Box sx={{ display: "inline-flex" }}>
            <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
          </Box>
        )}
      </FlowStatusCell>
      <TableCell>
        <Box>
          <Typography variant="body2">{displayTimeAgo}</Typography>
          {displayActor && (
            <Typography variant="body2" color="textSecondary">
              by {displayActor}
            </Typography>
          )}
        </Box>
      </TableCell>
      <FlowActionsCell
        className="actions-cell"
        align="center"
        onClick={(e) => e.stopPropagation()}
      >
        {canUserEditTeam(teamSlug) && (
          <FlowMenu
            flow={flow}
            refreshFlows={refreshFlows}
            isAnyTemplate={isAnyTemplate}
            variant="table"
          />
        )}
      </FlowActionsCell>
    </StyledTableRow>
  );
};
