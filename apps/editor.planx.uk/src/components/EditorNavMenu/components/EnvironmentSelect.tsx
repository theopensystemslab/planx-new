import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GitHubIcon from "@mui/icons-material/GitHub";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Dialog, { dialogClasses } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import React, { useState } from "react";
import { useLocation } from "react-use";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { CloseButton } from "ui/shared/CloseButton";

export interface Environment {
  name: string;
  description: string;
  url: string;
  pullRequestUrl?: string;
}

export interface Props {
  open: boolean;
  onClose: () => void;
  environments: Environment[];
  selectedEnvironmentId: string;
  onEnvironmentSelect: (environmentId: string) => void;
  title?: string;
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`&. ${dialogClasses.paper}`]: {
    backgroundColor: theme.palette.background.dark,
  },
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  border: "none",
  padding: 0,
}));

const StyledCard = styled(Card)<{ selected?: boolean }>(() => ({
  borderRadius: "2px",
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1, 1.25, 1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
}));

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
      <StyledDialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              position: "absolute",
              top: 0,
              left: 0,
              m: 0,
              width: "300px",
              maxWidth: "300px",
              minWidth: "unset",
              borderTop: "none",
              borderRadius: "5px",
            },
          },
        }}
      >
        <DialogHeader>
          <StyledDialogTitle>
            <Typography
              variant="subtitle1"
              component="span"
              sx={{ mr: 1, color: (theme) => theme.palette.common.white }}
            >
              Plan✕
            </Typography>
            <Typography variant="body2" component="span">
              environments
            </Typography>
          </StyledDialogTitle>
          <CloseButton
            size="small"
            onClick={handleClose}
            title="Close panel"
            sx={{ padding: 0 }}
          />
        </DialogHeader>
        <Stack
          sx={{
            p: 1,
            bgcolor: (theme) => theme.palette.background.dark,
            gap: 1,
          }}
        >
          {environments.map((env) => (
            <StyledCard key={env.name} selected={env.name === currentEnv}>
              <CardActionArea
                LinkComponent={"a"}
                href={env.url + pathname}
                target="_blank"
                rel="noopener noreferrer"
                disabled={env.name === currentEnv}
              >
                <CardContent>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: FONT_WEIGHT_SEMI_BOLD,
                        textTransform: "capitalize",
                      }}
                    >
                      {env.name}
                    </Typography>
                    <Typography
                      variant="body4"
                      component="p"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {env.description}
                    </Typography>
                  </Box>
                  {env.name === currentEnv && (
                    <CheckCircleIcon
                      sx={(theme) => ({
                        color: theme.palette.info.main,
                        fontSize: 20,
                      })}
                    />
                  )}
                </CardContent>
              </CardActionArea>
              {/* Render pull request link outside CardActionArea to prevent nested links */}
              {env.pullRequestUrl && (
                <Typography
                  component="a"
                  href={env.pullRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body4"
                  sx={{
                    display: "block",
                    px: 1,
                    pb: 1.25,
                    color: "link.main",
                    overflowWrap: "break-word",
                    wordBreak: "break-all",
                  }}
                >
                  {env.pullRequestUrl}
                </Typography>
              )}
            </StyledCard>
          ))}
        </Stack>
      </StyledDialog>
    </Root>
  );
};

export default EnvironmentSelect;
