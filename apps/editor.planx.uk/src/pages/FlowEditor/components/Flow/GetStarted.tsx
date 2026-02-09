import SchoolIcon from "@mui/icons-material/School";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Link } from "@tanstack/react-router";
import React from "react";

const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  width: "300px",
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.main}`,
  position: "relative",
  marginTop: theme.spacing(1),
  borderRadius: "4px",
  "&::before": {
    content: "''",
    position: "absolute",
    top: "-11px",
    left: `calc(50% - 1px)`,
    width: "2px",
    height: theme.spacing(1),
    background: "#D0D0D0",
  },
}));

export const GetStarted: React.FC = () => (
  <Root>
    <SchoolIcon />
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1">
        <strong>Starting a new flow?</strong>
      </Typography>
      <Typography variant="body2">
        Visit the <Link to="/app/tutorials">guides and tutorials</Link> to get
        started.
      </Typography>
    </Box>
  </Root>
);
