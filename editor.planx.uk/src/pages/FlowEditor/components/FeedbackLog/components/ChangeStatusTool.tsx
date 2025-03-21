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
import { FeedbackStatus } from "routes/feedback";

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
  const selectedRows = useGridSelector(apiRef, gridRowSelectionStateSelector);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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
        disabled={!selectedRows.length}
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
        <StyledMenuItem color={getColor("read")} onClick={handleClose}>
          Read
        </StyledMenuItem>
        <StyledMenuItem color={getColor("to_follow_up")} onClick={handleClose}>
          To follow up
        </StyledMenuItem>
        <StyledMenuItem color={getColor("urgent")} onClick={handleClose}>
          Urgent
        </StyledMenuItem>
        <StyledMenuItem color={getColor("unread")} onClick={handleClose}>
          Unread
        </StyledMenuItem>
      </Menu>
    </div>
  );
};
