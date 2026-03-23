import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Person from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover, { popoverClasses } from "@mui/material/Popover";
import { styled } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const HEADER_HEIGHT_EDITOR = 56;

const ProfileSection = styled(MuiToolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginRight: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    minHeight: HEADER_HEIGHT_EDITOR,
  },
  "@media print": {
    visibility: "hidden",
  },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  [`& .${popoverClasses.paper}`]: {
    boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
    backgroundColor: theme.palette.background.dark,
    borderRadius: 0,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
  borderRadius: 0,
  boxShadow: "none",
  minWidth: 180,
  "& li": {
    padding: theme.spacing(1.5, 2),
  },
}));

const AccountMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const user = useStore((state) => state.user);

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => navigate({ to: "/logout" });

  if (!user) return null;

  return (
    <>
      <ProfileSection disableGutters>
        <Box mr={1} />
        <IconButton
          ref={anchorRef}
          edge="end"
          color="inherit"
          aria-label="Toggle Menu"
          onClick={handleMenuToggle}
          size="large"
          sx={{ padding: "0.25em" }}
        >
          <Avatar
            component="span"
            sx={{
              bgcolor: grey[200],
              color: "text.primary",
              fontSize: "1rem",
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
              width: 33,
              height: 33,
              marginRight: "0.5rem",
            }}
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </Avatar>
          <Typography variant="body3">Account</Typography>
          <KeyboardArrowDown />
        </IconButton>
      </ProfileSection>
      <StyledPopover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <StyledPaper>
          <MenuItem disabled>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>{user.email}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout}>Log out</MenuItem>
        </StyledPaper>
      </StyledPopover>
    </>
  );
};

export default AccountMenu;
