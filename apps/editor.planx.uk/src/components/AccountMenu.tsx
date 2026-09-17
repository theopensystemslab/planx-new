import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { grey } from "@mui/material/colors";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { CloseButton } from "ui/shared/CloseButton";

const ProfileSection = styled(MuiToolbar)(({ theme }) => ({
  width: "inherit",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(0.5, 0.5, 1, 0.5),
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.border.light}`,
  borderTop: `1px solid ${theme.palette.border.light}`,
  zIndex: theme.zIndex.appBar,
  "@media print": {
    visibility: "hidden",
  },
}));

export interface AccountMenuProps {
  compact?: boolean;
}

const AccountMenu: React.FC<AccountMenuProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const user = useStore((state) => state.user);
  const userRole = useStore((state) => state.getUserRole());

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
        <IconButton
          ref={anchorRef}
          edge="end"
          color="inherit"
          aria-label="Toggle Menu"
          onClick={handleMenuToggle}
          size="large"
          sx={{
            padding: "0.25em",
            width: "100%",
            justifyContent: compact ? "center" : "flex-start",
          }}
        >
          <Avatar
            component="span"
            sx={{
              bgcolor: grey[900],
              color: "#fff",
              fontSize: "1rem",
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
              width: 33,
              height: 33,
              marginRight: compact ? 0 : "0.5rem",
            }}
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </Avatar>
          {!compact && (
            <>
              <Stack
                spacing={0.25}
                sx={{ alignItems: "flex-start", textAlign: "left" }}
              >
                <Typography
                  variant="body3"
                  sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body4">{userRole}</Typography>
              </Stack>

              <UnfoldMoreIcon fontSize="small" sx={{ marginLeft: "auto" }} />
            </>
          )}
        </IconButton>
      </ProfileSection>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        slots={{ transition: Fade }}
        marginThreshold={0}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              display: "flex",
              flexDirection: "column",
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
            },
          },
          // TODO: standardise backdrop scrim across the app
          backdrop: {
            sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 0.5,
            position: "sticky",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
          }}
        >
          <Typography variant="h4">
            {user.firstName} {user.lastName}
          </Typography>
          <CloseButton
            size="small"
            onClick={handleClose}
            sx={{ marginRight: -1 }}
          />
        </Box>
        <Box sx={{ px: 1.5, py: 1, flex: 1 }}>
          <Typography variant="body2">{user.email}</Typography>
        </Box>
        <Box sx={{ px: 1.5, py: 1, display: "flex", gap: 1 }}>
          <Button variant="contained" fullWidth onClick={handleLogout}>
            Log out of Plan✕
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default AccountMenu;
