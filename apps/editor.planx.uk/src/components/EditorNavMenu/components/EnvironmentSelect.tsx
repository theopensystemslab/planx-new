import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GitHubIcon from "@mui/icons-material/GitHub";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Box from "@mui/material/Box";
import MuiButtonBase from "@mui/material/ButtonBase";
import Fade from "@mui/material/Fade";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import React, { useState } from "react";
import { useLocation } from "react-use";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { getLogoForEnvironment } from "ui/icons/logos";
import { CloseButton } from "ui/shared/CloseButton";

export interface Environment {
  name: string;
  description: string;
  url: string;
  pullRequestUrl?: string;
}

const Root = styled(Box)(() => ({
  "@media print": {
    display: "none",
  },
}));

const StyledButtonBase = styled(ButtonBase)(({ theme }) => ({
  backgroundColor: "transparent",
  height: "auto",
  width: "auto",
  textTransform: "capitalize",
  color: theme.palette.text.primary,
  fontSize: theme.typography.body4.fontSize,
  gap: 0,
  "&:hover": {
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
  },
}));

const EnvironmentRow = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.border.light}`,
  "&:last-of-type": {
    borderBottom: "none",
  },
}));

const rowButtonSx: SxProps<Theme> = {
  width: "100%",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  textAlign: "left",
  gap: 1,
  padding: (theme) => theme.spacing(1.5),
  "&:hover": {
    backgroundColor: "background.disabled",
  },
  "&.Mui-disabled": {
    opacity: 1,
    backgroundColor: "background.disabled",
  },
};

const EnvironmentIcon = styled("img")({
  width: 20,
  height: 20,
  flexShrink: 0,
  marginTop: 2,
});

// Pizza environments are hosted at https://<PR number>.planx.pizza
const getPizzaPullRequestNumber = (): string | undefined =>
  window.location.hostname.match(/^(\d+)\.planx\.pizza$/)?.[1];

const environments: Environment[] = [
  {
    name: "production",
    description: "Used for editing content and publishing live flows",
    url: "https://editor.planx.uk",
  },
  {
    name: "staging",
    description:
      "Used for testing new features and content (all content will be overwritten by production overnight)",
    url: "https://editor.planx.dev",
  },
  // Only show this on Pizzas
  ...(import.meta.env.VITE_APP_ENV === "pizza"
    ? [
        {
          name: "pizza",
          description:
            "Temporary environment used for testing new features and content",
          url: window.location.href,
          pullRequestUrl: getPizzaPullRequestNumber()
            ? `https://github.com/theopensystemslab/planx-new/pull/${getPizzaPullRequestNumber()}`
            : undefined,
        },
      ]
    : []),
  // Only show this locally
  ...(import.meta.env.VITE_APP_ENV === "development"
    ? [
        {
          name: "development",
          description: "Local development",
          url: "http:/localhost:3000",
        },
      ]
    : []),
];

const ENV_DISPLAY_NAMES: Record<string, string> = {
  development: "Dev",
};

// Matches the inset used by the other nav panel triggers (theme.spacing(0.5))
const PANEL_INSET = 5;

const EnvironmentSelect: React.FC = () => {
  const [open, setOpen] = useState(false);
  const currentEnv = import.meta.env.VITE_APP_ENV;
  const pizzaPullRequestNumber =
    currentEnv === "pizza" ? getPizzaPullRequestNumber() : undefined;
  const displayEnv = ENV_DISPLAY_NAMES[currentEnv] ?? currentEnv;
  const { pathname } = useLocation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Root>
      <StyledButtonBase onClick={handleOpen} selected={false}>
        {pizzaPullRequestNumber ? (
          <>
            <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
            {pizzaPullRequestNumber}
          </>
        ) : (
          displayEnv
        )}
        <UnfoldMoreIcon fontSize="small" />
      </StyledButtonBase>
      <Popover
        open={open}
        onClose={handleClose}
        slots={{ transition: Fade }}
        marginThreshold={0}
        anchorReference="anchorPosition"
        anchorPosition={{ top: PANEL_INSET, left: PANEL_INSET }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              display: "flex",
              flexDirection: "column",
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
            },
          },
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
          <Typography variant="h4">Environments</Typography>
          <CloseButton
            size="small"
            onClick={handleClose}
            sx={{ marginRight: -1 }}
          />
        </Box>
        <Stack>
          {environments.map((env) => (
            <EnvironmentRow key={env.name}>
              <MuiButtonBase
                component="a"
                href={env.url + pathname}
                target="_blank"
                rel="noopener noreferrer"
                disabled={env.name === currentEnv}
                sx={rowButtonSx}
              >
                <EnvironmentIcon src={getLogoForEnvironment(env.name)} alt="" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{
                        fontWeight: FONT_WEIGHT_SEMI_BOLD,
                        textTransform: "capitalize",
                      }}
                    >
                      {env.name}
                    </Typography>
                    {env.name === currentEnv && (
                      <CheckCircleIcon
                        sx={(theme) => ({
                          color: theme.palette.info.main,
                          fontSize: 18,
                        })}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body4"
                    component="p"
                    sx={{ color: "text.secondary" }}
                  >
                    {env.description}
                  </Typography>
                </Box>
              </MuiButtonBase>
              {/* Render pull request link outside the row button to prevent nested links */}
              {env.pullRequestUrl && (
                <Typography
                  component="a"
                  href={env.pullRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body4"
                  sx={{
                    display: "block",
                    padding: (theme) => theme.spacing(0, 4.5, 1.5, 4.5),
                    backgroundColor: "background.disabled",
                    color: "link.main",
                    overflowWrap: "break-word",
                    wordBreak: "break-all",
                  }}
                >
                  {env.pullRequestUrl}
                </Typography>
              )}
            </EnvironmentRow>
          ))}
        </Stack>
      </Popover>
    </Root>
  );
};

export default EnvironmentSelect;
