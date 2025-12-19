import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import Search from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

const StyledButtonBase = styled(ButtonBase)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  borderLeft: "8px solid OliveDrab",
  borderRadius: 3,
  padding: theme.spacing(1, 1.25),
  justifyContent: "space-between",
  // Todo: standardise box shadow across nav menu items
  boxShadow: "0 1px 1.5px 0 rgba(0, 0, 0, 0.2)",
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  border: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
}));

const StyledCard = styled(Card)<{ selected?: boolean }>(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: 3,
  borderLeft: "6px solid OliveDrab",
  padding: theme.spacing(0.75),
  boxShadow: "0 1px 1.5px 0 rgba(0, 0, 0, 0.2)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const TeamSelect: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <StyledButtonBase onClick={handleOpen} selected={false} sx={{ ml: 0.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body3" component="span" color="text.secondary">
            Team
          </Typography>
          <Typography
            variant="body2"
            component="span"
            color="text.primary"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            Current team
          </Typography>
        </Box>
        <UnfoldMoreIcon sx={{ color: "text.secondary", fontSize: "1.75rem" }} />
      </StyledButtonBase>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        PaperProps={{
          sx: {
            position: "absolute",
            top: 5,
            left: 10,
            m: 0,
            width: "300px",
            maxWidth: "300px",
            minWidth: "unset",
            borderTop: "none",
            borderRadius: 3,
          },
        }}
      >
        <StyledDialogTitle>
          <Box>
            <Typography variant="h4" component="span">
              Select a team
            </Typography>
          </Box>
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <Box p={1} pb={1.5} pt={0}>
          <InputLabel htmlFor="search" hidden label="Search teams" />
          <Input
            sx={{
              py: 0.5,
              px: 1,
              height: "40px",
            }}
            name="search"
            id="search"
            aria-describedby="search-label"
            placeholder="Search teams"
            startAdornment={
              <Search sx={{ ml: -0.5, mr: 0.5, fontSize: "1.25rem" }} />
            }
          />
          <Stack gap={2} pt={2}>
            <Stack gap={1}>
              <Typography variant="body3" component="span">
                My teams
              </Typography>
              <Stack gap={0.75}>
                <StyledCard selected={true}>
                  <Typography
                    variant="body3"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    Current team
                  </Typography>
                  {true && (
                    <CheckCircleIcon
                      sx={(theme) => ({
                        color: theme.palette.info.main,
                        fontSize: "1em",
                      })}
                    />
                  )}
                </StyledCard>
                <StyledCard>
                  <Typography
                    variant="body3"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    Another team
                  </Typography>
                </StyledCard>
              </Stack>
            </Stack>
            <Stack gap={1}>
              <Typography variant="body3" component="span">
                Other teams (view only)
              </Typography>
              <Stack gap={0.75}>
                <StyledCard selected={true}>
                  <Typography
                    variant="body3"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    Another team
                  </Typography>
                </StyledCard>
                <StyledCard>
                  <Typography
                    variant="body3"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    Another team
                  </Typography>
                </StyledCard>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
};

export default TeamSelect;
