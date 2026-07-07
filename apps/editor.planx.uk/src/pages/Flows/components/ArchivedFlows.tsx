import type { ApolloError } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";
import { EmptyState } from "ui/editor/EmptyState";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import type {
  FlowCardView,
  FlowSummary,
} from "../../FlowEditor/lib/store/editor";
import { sortOptions } from "../helpers/sortAndFilterOptions";
import FlowCard from "./FlowCard";
import { FlowGrid } from "./FlowGrid";
import { FlowTable } from "./FlowTable";
import { useDisplayedFlows } from "./hooks/useDisplayedFlows";
import { ShowingServicesHeader } from "./ShowingServicesHeader";
import { StyledToggleButton } from "./StyledToggleButton";

type Props = {
  flowCardView: FlowCardView;
  handleViewChange: (
    _event: React.MouseEvent<HTMLElement>,
    newView: FlowCardView | null,
  ) => void;
  teamId: number;
  slug: string;
  archivedFlows: FlowSummary[] | null;
  loading: boolean;
  error: ApolloError | undefined;
  onClearSearch: () => void;
};

const ArchivedFlows: React.FC<Props> = ({
  flowCardView,
  handleViewChange,
  teamId,
  slug,
  archivedFlows,
  loading,
  error,
  onClearSearch,
}) => {
  const { displayedFlows, isFiltered } = useDisplayedFlows({
    flows: archivedFlows,
    sortOptions,
  });

  if (error) {
    return (
      <Box sx={{ pt: 2 }}>
        <ErrorSummary message={error.message} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          pt: 2,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 2,
          minHeight: "50px",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isFiltered && archivedFlows !== null && archivedFlows.length === 0) {
    return <EmptyState title="No archived flows found" icon={<DeleteIcon />} />;
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          pt: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 2,
            minHeight: "50px",
          }}
        >
          <ShowingServicesHeader
            matchedFlowsCount={displayedFlows?.length || 0}
            isArchived
            isFiltered={isFiltered}
          />
          {isFiltered && (
            <Button onClick={onClearSearch} variant="link">
              Clear filters
            </Button>
          )}
        </Box>
        <ToggleButtonGroup
          value={flowCardView}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <Tooltip title="Card view" placement="bottom">
            <StyledToggleButton value="grid" disableRipple>
              <ViewModuleIcon />
            </StyledToggleButton>
          </Tooltip>
          <Tooltip title="Table view" placement="bottom">
            <StyledToggleButton value="row" disableRipple>
              <TableRowsIcon />
            </StyledToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
      {displayedFlows && (
        <>
          {flowCardView === "grid" ? (
            <FlowGrid>
              {displayedFlows.map((flow) => (
                <FlowCard flow={flow} key={flow.slug} view={"archive"} />
              ))}
            </FlowGrid>
          ) : (
            <FlowTable
              flows={displayedFlows}
              teamId={teamId}
              teamSlug={slug}
              view={"archive"}
            />
          )}
        </>
      )}
    </>
  );
};
export default ArchivedFlows;
