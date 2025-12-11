import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Dialog, { dialogClasses } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import React, { useState } from "react";
import { useLocation } from "react-use";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export interface Environment {
  name: string;
  description: string;
  url: string;
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

const StyledButtonBase = styled(ButtonBase)(() => ({
  backgroundColor: "transparent",
  height: "auto",
  width: "auto",
  textTransform: "capitalize",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`&. ${dialogClasses.paper}`]: {
    backgroundColor: theme.palette.background.dark,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  border: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
}));

const StyledCard = styled(Card)<{ selected?: boolean }>(() => ({
  borderRadius: 5,
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
}));

const environments: Environment[] = [
  {
    name: "production",
    description: "Used for editing content and publishing live flows",
    url: "https://editor.planx.uk",
  },
  {
    name: "staging",
    description: "Used for testing new features and content",
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

export const EnvironmentSelect: React.FC = () => {
  const [open, setOpen] = useState(false);
  const currentEnv = import.meta.env.VITE_APP_ENV;
  const { pathname } = useLocation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Root>
      <StyledButtonBase onClick={handleOpen} selected={false} sx={{ ml: 0.5 }}>
        {currentEnv}
        <UnfoldMoreIcon />
      </StyledButtonBase>
      <StyledDialog
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
            <Typography variant="body1" component="span" mr={1}>
              Plan✕
            </Typography>
            <Typography variant="body1" component="span">
              environments
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: "#ffffff", padding: 0 }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <Stack p={1} bgcolor={(theme) => theme.palette.background.dark} gap={1}>
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
                  <Box>
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
                    <Typography variant="body3" color="text.secondary">
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
            </StyledCard>
          ))}
        </Stack>
      </StyledDialog>
    </Root>
  );
};

export default EnvironmentSelect;
