import RateReview from "@mui/icons-material/RateReview";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled, useTheme } from "@mui/material/styles";
import {
  gridRowSelectionStateSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import * as React from "react";

import { statusOptions } from "../feedbackFilterOptions";
import { updateFeedbackStatus } from "../queries/updateFeedbackStatus";
import { FeedbackStatus } from "../types";
import { FEEDBACK_COLOURS } from "./StatusChip";

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== "color",
})(({ theme, color }) => ({
  borderLeft: `6px solid ${color}`,
  marginLeft: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  "&:last-child": {
    marginBottom: 0,
  },
}));

export const ChangeStatusTool: React.FC = () => {
  const apiRef = useGridApiContext();
  const selectedRowIds = useGridSelector(apiRef, gridRowSelectionStateSelector);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const updateGridUI = (status: FeedbackStatus) => {
    selectedRowIds.forEach((id) => {
      apiRef.current.updateRows([{ id, status }]);
    });

    // Deselect rows
    apiRef.current.setRowSelectionModel([]);
  };

  const handleChangeStatus = async (status: FeedbackStatus) => {
    // Close menu immediately before starting async operations
    handleClose();

    try {
      await updateFeedbackStatus(selectedRowIds, status);
      updateGridUI(status);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = useTheme();
  const getColor = (status: FeedbackStatus) =>
    theme.palette[FEEDBACK_COLOURS[status]].main;

  return (
    <div>
      <Button
        startIcon={<RateReview />}
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
        disabled={!selectedRowIds.length}
      >
        Mark as
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {statusOptions.map(({ value, label }, index) => (
          <StyledMenuItem
            color={getColor(value)}
            onClick={() => handleChangeStatus(value)}
            value={value}
            key={`statusMenuItem-${index}`}
          >
            {label}
          </StyledMenuItem>
        ))}
      </Menu>
    </div>
  );
};
