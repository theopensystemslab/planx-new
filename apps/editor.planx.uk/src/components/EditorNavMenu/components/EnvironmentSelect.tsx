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

export interface Environment {
  id: string;
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

const StyledButtonBase = styled(ButtonBase)(() => ({
  backgroundColor: "transparent",
  height: "auto",
  width: "auto",
  textTransform: "capitalize",
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`&. ${dialogClasses.paper}`]: {
    backgroundColor: theme.palette.background.dark,
    color: "#ffffff",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  border: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.dark,
  color: "#ffffff",
}));

const StyledCard = styled(Card)<{ selected?: boolean }>(() => ({
  backgroundColor: "#ffffff",
  color: "#000000",
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
    id: "production",
    name: "Production",
    description: "Used for editing content and publishing live flows",
    url: "https://editor.planx.uk",
  },
  {
    id: "staging",
    name: "Staging",
    description: "Used for testing new features and content",
    url: "https://editor.planx.dev",
  },
  // Only show this on Pizzas
  ...(import.meta.env.VITE_APP_ENV === "pizza" ? [{
    id: "pizza",
    name: "Pizza",
    description: "Temporary environment used for testing new features and content",
    url: window.location.href
  }] : []),
  // Only show this locally
  ...(import.meta.env.VITE_APP_ENV === "development" ? [{
    id: "development",
    name: "Development",
    description: "Local development",
    url: "http:/localhost:3000",
  }] : []),
];

export const EnvironmentSelect: React.FC = () => {
  const [open, setOpen] = useState(false);
  const currentEnv = import.meta.env.VITE_APP_ENV;
  const { pathname } = useLocation();

  const navigateTo = (env: Environment) => window.location.href = env.url + pathname;
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <StyledButtonBase onClick={handleOpen} selected={false}>
        {currentEnv}
        <UnfoldMoreIcon sx={{ ml: 0.5 }} />
      </StyledButtonBase>
      <StyledDialog open={open} onClose={handleClose} maxWidth="xs"
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
        }}>
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
            <StyledCard
              key={env.id}
              selected={env.id === currentEnv}
            >
              <CardActionArea 
                onClick={() => navigateTo(env)} 
                disabled={env.id === currentEnv}
              >
                <CardContent>
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 600, marginBottom: 1 }}
                    >
                      {env.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {env.description}
                    </Typography>
                  </Box>
                  {env.id === currentEnv && (
                    <CheckCircleIcon sx={(theme) => ({ color: theme.palette.info.main, fontSize: 20 })} />
                  )}
                </CardContent>
              </CardActionArea>
            </StyledCard>
          ))}
        </Stack>
      </StyledDialog>
    </>
  );
};

export default EnvironmentSelect;